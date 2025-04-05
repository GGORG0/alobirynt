import Link from 'next/link';

export default function Home() {
  return (
    <>
      <p>Home</p>
      <Link href="/admin">go to admin</Link>
    </>
  );
}
