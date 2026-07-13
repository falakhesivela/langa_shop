import { GOOGLE_DRIVE_API_KEY, GOOGLE_DRIVE_CLIENT_ID } from "@/lib/config";

const IDENTITY_SRC = "https://accounts.google.com/gsi/client";
const API_SRC = "https://apis.google.com/js/api.js";

/** The Picker hands us per-file access to exactly what the admin selects, so the
 * narrow drive.file scope is enough — we never need to read the whole Drive. */
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
};

type TokenClient = {
  requestAccessToken: (overrides?: { prompt?: string }) => void;
};

type PickerDoc = {
  id: string;
  name: string;
  mimeType: string;
};

type PickerResponse = {
  action: string;
  docs?: PickerDoc[];
};

type DocsView = {
  setMimeTypes: (mimeTypes: string) => DocsView;
  setIncludeFolders: (include: boolean) => DocsView;
};

type PickerBuilder = {
  setTitle: (title: string) => PickerBuilder;
  setDeveloperKey: (key: string) => PickerBuilder;
  setAppId: (appId: string) => PickerBuilder;
  setOAuthToken: (token: string) => PickerBuilder;
  addView: (view: DocsView) => PickerBuilder;
  enableFeature: (feature: string) => PickerBuilder;
  setCallback: (callback: (response: PickerResponse) => void) => PickerBuilder;
  build: () => { setVisible: (visible: boolean) => void };
};

type PickerNamespace = {
  PickerBuilder: new () => PickerBuilder;
  DocsView: new (viewId: string) => DocsView;
  ViewId: { DOCS_IMAGES: string };
  Action: { PICKED: string; CANCEL: string };
  Feature: { MULTISELECT_ENABLED: string };
};

type DriveWindow = {
  gapi?: { load: (name: string, callback: () => void) => void };
  google?: {
    accounts?: {
      oauth2: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: TokenResponse) => void;
          error_callback?: (error: { message?: string }) => void;
        }) => TokenClient;
      };
    };
    picker?: PickerNamespace;
  };
};

/** Read Google's globals without widening the app-wide `Window` type, which the
 * Maps typings already contribute a `google` namespace to. */
function driveWindow(): DriveWindow {
  return window as unknown as DriveWindow;
}

export function isDrivePickerEnabled(): boolean {
  return Boolean(GOOGLE_DRIVE_CLIENT_ID && GOOGLE_DRIVE_API_KEY);
}

const scriptPromises = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  const existing = scriptPromises.get(src);
  if (existing) return existing;

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}.`));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    // Drop the rejected promise so a later attempt can retry the download.
    scriptPromises.delete(src);
    throw error;
  });

  scriptPromises.set(src, promise);
  return promise;
}

let pickerApiPromise: Promise<PickerNamespace> | null = null;

function loadPickerApi(): Promise<PickerNamespace> {
  if (!pickerApiPromise) {
    pickerApiPromise = loadScript(API_SRC)
      .then(
        () =>
          new Promise<PickerNamespace>((resolve, reject) => {
            const gapi = driveWindow().gapi;
            if (!gapi) {
              reject(new Error("Google API script loaded without gapi."));
              return;
            }
            gapi.load("picker", () => {
              const picker = driveWindow().google?.picker;
              if (!picker) {
                reject(new Error("Google Picker failed to initialise."));
                return;
              }
              resolve(picker);
            });
          }),
      )
      .catch((error: unknown) => {
        pickerApiPromise = null;
        throw error;
      });
  }

  return pickerApiPromise;
}

type CachedToken = { value: string; expiresAt: number };

let cachedToken: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  await loadScript(IDENTITY_SRC);

  return new Promise<string>((resolve, reject) => {
    const oauth2 = driveWindow().google?.accounts?.oauth2;
    if (!oauth2) {
      reject(new Error("Google Identity script loaded without oauth2."));
      return;
    }

    const client = oauth2.initTokenClient({
      client_id: GOOGLE_DRIVE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (!response.access_token) {
          reject(
            new Error(response.error ?? "Google Drive access was not granted."),
          );
          return;
        }
        cachedToken = {
          value: response.access_token,
          expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
        };
        resolve(response.access_token);
      },
      error_callback: (error) => {
        reject(new Error(error.message ?? "Google Drive sign-in was cancelled."));
      },
    });

    // An empty prompt reuses consent the admin already gave, so picking images
    // repeatedly does not reopen the consent screen every time.
    client.requestAccessToken({ prompt: "" });
  });
}

/** The Picker's app ID is the Cloud project number, which is the numeric prefix
 * of the OAuth client ID. It is required for drive.file access. */
function driveAppId(): string {
  return GOOGLE_DRIVE_CLIENT_ID.split("-")[0] ?? "";
}

function showPicker(
  picker: PickerNamespace,
  accessToken: string,
): Promise<PickerDoc[]> {
  return new Promise<PickerDoc[]>((resolve) => {
    const view = new picker.DocsView(picker.ViewId.DOCS_IMAGES)
      .setMimeTypes(IMAGE_MIME_TYPES.join(","))
      .setIncludeFolders(true);

    new picker.PickerBuilder()
      .setTitle("Select product images")
      .setDeveloperKey(GOOGLE_DRIVE_API_KEY)
      .setAppId(driveAppId())
      .setOAuthToken(accessToken)
      .addView(view)
      .enableFeature(picker.Feature.MULTISELECT_ENABLED)
      .setCallback((response) => {
        if (response.action === picker.Action.PICKED) {
          resolve(response.docs ?? []);
        } else if (response.action === picker.Action.CANCEL) {
          resolve([]);
        }
      })
      .build()
      .setVisible(true);
  });
}

async function downloadDoc(doc: PickerDoc, accessToken: string): Promise<File> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(doc.id)}?alt=media&supportsAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    if (response.status === 401) {
      cachedToken = null;
    }
    throw new Error(
      `Failed to download "${doc.name}" from Google Drive (${response.status}).`,
    );
  }

  const blob = await response.blob();
  return new File([blob], doc.name, { type: doc.mimeType || blob.type });
}

/** Open the Google Drive picker and download whatever the admin selects.
 * Resolves to an empty array when the picker is dismissed. */
export async function pickImagesFromDrive(): Promise<File[]> {
  if (!isDrivePickerEnabled()) {
    throw new Error("Google Drive is not configured.");
  }

  const picker = await loadPickerApi();
  const accessToken = await getAccessToken();
  const docs = await showPicker(picker, accessToken);

  return Promise.all(docs.map((doc) => downloadDoc(doc, accessToken)));
}
