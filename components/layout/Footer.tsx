import { APP_NAME } from "@/lib/config";
import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white">
      <Container className="flex h-16 items-center justify-between text-sm text-stone-500">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}</p>
        <p>Thoughtfully curated goods.</p>
      </Container>
    </footer>
  );
}
