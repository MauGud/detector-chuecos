import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="description" content="NEXCAR Blog - Estrategias para construir y escalar tu negocio digital" />
        <meta property="og:title" content="NEXCAR Blog" />
        <meta property="og:description" content="Estrategias, insights y casos reales para construir y escalar tu negocio digital" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <body className="bg-slate-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
