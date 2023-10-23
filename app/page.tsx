"use client";

export default function Home() {
  const onClick = () => {
    fetch("/api/location")
      .then((resp) => resp.json())
      .then((data) => console.log(data));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p>hello world</p>
        <button onClick={onClick}>Hello</button>
      </div>
    </main>
  );
}
