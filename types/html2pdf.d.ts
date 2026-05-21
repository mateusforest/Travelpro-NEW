declare module "html2pdf.js" {
  type Html2PdfInstance = {
    set: (options: unknown) => Html2PdfInstance
    from: (element: HTMLElement) => Html2PdfInstance
    save: () => Promise<void>
  }

  const html2pdf: () => Html2PdfInstance

  export default html2pdf
}
