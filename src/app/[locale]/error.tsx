"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <div className="not-found shell"><span>!</span><h1>No hemos podido cargar esta página.</h1><p>Prueba de nuevo dentro de un momento.</p><button onClick={reset}>Reintentar</button></div>; }
