/**
 * Espera a que la hoja de adjuntos termine de cerrarse antes de abrir un selector nativo.
 * En iOS, abrirlo mientras la hoja todavía se cierra hace que el selector cancele sin avisar.
 */
export const waitForSheetDismiss = (ms = 400) => new Promise<void>(resolve => setTimeout(resolve, ms));
