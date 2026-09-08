import { Language } from '../types';

export interface Translations {
  tagline: string;
  badge: string;
  gallery: string;
  login: string;
  connected: string;
  help: string;
  soundOn: string;
  soundOff: string;
  languageSelect: string;

  // Viewfinder & Aspect
  aspectDoc: string;
  aspectSquare: string;
  aspectCamera: string;
  aspectWide: string;
  aspectStrip: string;
  guide3x4: string;
  gridGuide: string;
  mirror: string;
  tripleShot: string;
  shutterAria: string;
  library: string;

  // Filters Card
  basicFilters: string;
  lightAdjustments: string;
  hideSliders: string;
  normal: string;
  bw: string;
  highLight: string;
  lowLight: string;
  moreFilters: string;
  fewerFilters: string;
  manualExposure: string;
  brightness: string;
  contrast: string;
  reset: string;

  // Stickers Card
  funStickers: string;
  clearStickers: string;
  dragTip: string;
  moreStickers: string;
  capturePhoto: string;
  capture3x4: string;
  dropToDelete: string;
  dragHereToDelete: string;
  stickerDeleted: string;
  stickerLibraryTitle: string;
  stickerLibrarySub: string;
  categoriesAll: string;
  categoriesAccessories: string;
  categoriesFace: string;
  categoriesEmojis: string;
  categories3x4: string;
  categoriesRetro: string;

  // Photo Editor Modal
  photoCapturedSuccess: string;
  photoAutoSavedNotice: string;
  downloadPhoto: string;
  printSheet3x4: string;
  generatingSheet: string;
  downloadSheetAction: string;
  backToPhoto: string;
  copy: string;
  copied: string;
  share: string;
  viewInGallery: string;
  newPhoto: string;
  standard3x4Tag: string;

  // Gallery Drawer
  yourGallery: string;
  photosSavedCount: (count: number) => string;
  syncedGoogle: string;
  storedLocally: string;
  syncedAccountSub: (email: string) => string;
  storedLocallySub: string;
  connectGoogle: string;
  downloadAll: string;
  clearGallery: string;
  noPhotosYet: string;
  noPhotosYetSub: string;
  viewingPhoto: string;
  deleteConfirm: string;

  // Google Modal
  googleModalTitle: string;
  googleOAuthTitle?: string;
  googleModalSub: string;
  googleOAuthSub?: string;
  googleFreeNoticeTitle: string;
  googleFreeNotice?: string;
  googleFreeNoticeSub: string;
  googleAccountLabel: string;
  googleAccountForSync?: string;
  googleConnectBtn: string;
  connectedActive: string;
  allPhotosSyncedNotice: string;
  syncedAccountActive?: string;
  disconnectBtn: string;
  disconnect?: string;
  advancedClientId: string;

  // Help Modal
  helpTitle: string;
  helpSub: string;
  helpDocTitle: string;
  helpDocPoints: string[];
  helpDocItem1?: string;
  helpDocItem2?: string;
  helpDocItem3?: string;
  helpFiltersTitle: string;
  helpFiltersBody: string;
  helpFiltersDesc?: string;
  helpStickersTitle: string;
  helpStickersBody: string;
  helpStickersDesc?: string;
  helpUnderstoodBtn: string;
  helpGotIt?: string;

  // Ads
  adSponsored: string;
  adRefreshIn: string;
  adClose: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  pt: {
    tagline: 'Fotos 3x4 & Filtros Divertidos',
    badge: 'Webcam Toy',
    gallery: 'Galeria',
    login: 'Entrar',
    connected: 'Conectado',
    help: 'Dicas e Ajuda',
    soundOn: 'Ativar sons',
    soundOff: 'Silenciar sons',
    languageSelect: 'Idioma',

    aspectDoc: 'Doc',
    aspectSquare: 'Quad',
    aspectCamera: 'Cam',
    aspectWide: 'Wide',
    aspectStrip: 'Toy',
    guide3x4: 'Guia 3x4',
    gridGuide: 'Grade',
    mirror: 'Espelhar',
    tripleShot: 'Disparo Triplo',
    shutterAria: 'Tirar Foto',
    library: 'Biblioteca',

    basicFilters: 'Filtros Básicos',
    lightAdjustments: 'Ajustes de Luz',
    hideSliders: 'Ocultar Sliders',
    normal: 'Normal',
    bw: 'P&B',
    highLight: 'Alta Luz',
    lowLight: 'Baixa Luz',
    moreFilters: '▼ Mais filtros (Noir, Vintage, Cyber Pop, Invertido)',
    fewerFilters: '▲ Menos filtros',
    manualExposure: 'Ajustes Manuais de Exposição',
    brightness: 'Brilho',
    contrast: 'Contraste',
    reset: 'Reset',

    funStickers: 'Adesivos Fun',
    clearStickers: 'Limpar',
    dragTip: 'Arraste os adesivos pelo visor para posicionar',
    moreStickers: 'Mais',
    capturePhoto: 'Tirar Foto / Baixar',
    capture3x4: 'Capturar Foto 3x4',
    dropToDelete: 'Solte para Excluir!',
    dragHereToDelete: 'Arraste aqui para Excluir',
    stickerDeleted: 'Adesivo excluído!',
    stickerLibraryTitle: 'Biblioteca de Adesivos',
    stickerLibrarySub: 'Toque para colar na câmera e arraste pelo visor para encaixar',
    categoriesAll: 'Todos',
    categoriesAccessories: 'Acessórios',
    categoriesFace: 'Rosto',
    categoriesEmojis: 'Emojis',
    categories3x4: 'Selos 3x4',
    categoriesRetro: 'Retrô',

    photoCapturedSuccess: 'Foto Capturada!',
    photoAutoSavedNotice: 'Salva automaticamente na galeria',
    downloadPhoto: 'Baixar Foto',
    printSheet3x4: 'Cartela 3x4 (Impressão)',
    generatingSheet: 'Montando Cartela...',
    downloadSheetAction: 'Baixar Cartela (6 Fotos 3x4)',
    backToPhoto: 'Voltar',
    copy: 'Copiar',
    copied: 'Copiado!',
    share: 'Compartilhar',
    viewInGallery: 'Ver na Galeria',
    newPhoto: 'Nova Foto',
    standard3x4Tag: 'Padrão 3x4',

    yourGallery: 'Sua Galeria',
    photosSavedCount: (count: number) =>
      `${count} foto${count !== 1 ? 's' : ''} gravada${count !== 1 ? 's' : ''}`,
    syncedGoogle: 'Sincronizado no Google',
    storedLocally: 'Armazenado no Navegador',
    syncedAccountSub: (email: string) => `Vinculado a ${email}`,
    storedLocallySub: 'Funciona 100% sem login! Fotos salvas localmente.',
    connectGoogle: 'Conectar',
    downloadAll: 'Baixar Todas',
    clearGallery: 'Limpar Galeria',
    noPhotosYet: 'Nenhuma foto ainda',
    noPhotosYetSub: 'Clique no botão de disparo na câmera para registrar sua primeira foto!',
    viewingPhoto: 'Visualizando Foto',
    deleteConfirm: 'Tem certeza que deseja apagar todas as fotos da galeria?',

    googleModalTitle: 'Google OAuth & Nuvem',
    googleOAuthTitle: 'Google OAuth & Nuvem',
    googleModalSub: 'Sincronização de galeria opcional',
    googleOAuthSub: 'Sincronização de galeria opcional',
    googleFreeNoticeTitle: 'O autophoto é 100% gratuito e não exige login!',
    googleFreeNotice: 'O autophoto é 100% gratuito e não exige login!',
    googleFreeNoticeSub:
      'Você pode tirar fotos, aplicar filtros, salvar cartelas 3x4 e baixar sem criar conta. A conexão com o Google serve para quem deseja salvar uma galeria online.',
    googleAccountLabel: 'Conta Google para sincronização:',
    googleAccountForSync: 'Conta Google para sincronização:',
    googleConnectBtn: 'Conectar com Google',
    connectedActive: 'Ativo',
    allPhotosSyncedNotice: 'Todas as fotos tiradas estão sendo vinculadas ao seu perfil.',
    syncedAccountActive: 'Todas as fotos tiradas estão sendo vinculadas ao seu perfil.',
    disconnectBtn: 'Desconectar',
    disconnect: 'Desconectar',
    advancedClientId: 'Configuração avançada de Client ID',

    helpTitle: 'Como usar o autophoto',
    helpSub: 'Guia rápido de foto 3x4 e efeitos',
    helpDocTitle: 'Fotos 3x4 para Documentos',
    helpDocPoints: [
      'Use a linha guia pontilhada para alinhar olhos e queixo.',
      'Fique contra uma parede clara e com luz frontal suave.',
      'Após tirar a foto, use o botão Cartela 3x4 para baixar uma folha com 6 cópias com marcas de corte prontas para impressão!',
    ],
    helpDocItem1: 'Use a linha guia pontilhada para alinhar olhos e queixo.',
    helpDocItem2: 'Fique contra uma parede clara e com luz frontal suave.',
    helpDocItem3: 'Após tirar a foto, use o botão Cartela 3x4 para baixar uma folha com 6 cópias com marcas de corte prontas para impressão!',
    helpFiltersTitle: 'Filtros de Luz e P&B',
    helpFiltersBody:
      'Use Alta Luz para clarear webcam escura ou dar visual de estúdio, Baixa Luz para um tom intimista e P&B para fotos monocromáticas atemporais.',
    helpFiltersDesc:
      'Use Alta Luz para clarear webcam escura ou dar visual de estúdio, Baixa Luz para um tom intimista e P&B para fotos monocromáticas atemporais.',
    helpStickersTitle: 'Adesivos Fun & Brincadeiras',
    helpStickersBody:
      'Toque nos adesivos para colar na tela. Você pode arrastá-los livremente pelo visor para encaixar no seu rosto ou arrastar para a lixeira na parte inferior para excluir!',
    helpStickersDesc:
      'Toque nos adesivos para colar na tela. Você pode arrastá-los livremente pelo visor para encaixar no seu rosto ou arrastar para a lixeira na parte inferior para excluir!',
    helpUnderstoodBtn: 'Entendido, vamos lá!',
    helpGotIt: 'Entendido, vamos lá!',

    adSponsored: 'Patrocinado',
    adRefreshIn: 'Atualiza em',
    adClose: 'Fechar',
  },

  en: {
    tagline: '3x4 Photos & Fun Webcam Filters',
    badge: 'Webcam Toy',
    gallery: 'Gallery',
    login: 'Sign In',
    connected: 'Connected',
    help: 'Tips & Help',
    soundOn: 'Unmute sounds',
    soundOff: 'Mute sounds',
    languageSelect: 'Language',

    aspectDoc: 'Doc',
    aspectSquare: 'Square',
    aspectCamera: 'Cam',
    aspectWide: 'Wide',
    aspectStrip: 'Toy',
    guide3x4: '3x4 Guide',
    gridGuide: 'Grid',
    mirror: 'Mirror',
    tripleShot: 'Burst 3x',
    shutterAria: 'Take Photo',
    library: 'Library',

    basicFilters: 'Basic Filters',
    lightAdjustments: 'Light Tuning',
    hideSliders: 'Hide Sliders',
    normal: 'Normal',
    bw: 'B&W',
    highLight: 'High Light',
    lowLight: 'Low Light',
    moreFilters: '▼ More filters (Noir, Vintage, Cyber Pop, Invert)',
    fewerFilters: '▲ Fewer filters',
    manualExposure: 'Manual Exposure Adjustments',
    brightness: 'Brightness',
    contrast: 'Contrast',
    reset: 'Reset',

    funStickers: 'Fun Stickers',
    clearStickers: 'Clear',
    dragTip: 'Drag stickers around the viewfinder to place them',
    moreStickers: 'More',
    capturePhoto: 'Take Photo / Download',
    capture3x4: 'Capture 3x4 Photo',
    dropToDelete: 'Drop to Delete!',
    dragHereToDelete: 'Drag here to Delete',
    stickerDeleted: 'Sticker removed!',
    stickerLibraryTitle: 'Sticker Library',
    stickerLibrarySub: 'Tap to stick on camera, drag across viewfinder to position',
    categoriesAll: 'All',
    categoriesAccessories: 'Accessories',
    categoriesFace: 'Face',
    categoriesEmojis: 'Emojis',
    categories3x4: '3x4 Stamps',
    categoriesRetro: 'Retro',

    photoCapturedSuccess: 'Photo Captured!',
    photoAutoSavedNotice: 'Saved automatically to gallery',
    downloadPhoto: 'Download Photo',
    printSheet3x4: '3x4 Sheet (Print)',
    generatingSheet: 'Building Sheet...',
    downloadSheetAction: 'Download Sheet (6 Photos 3x4)',
    backToPhoto: 'Back',
    copy: 'Copy',
    copied: 'Copied!',
    share: 'Share',
    viewInGallery: 'View in Gallery',
    newPhoto: 'Take Another',
    standard3x4Tag: '3x4 Standard',

    yourGallery: 'Your Gallery',
    photosSavedCount: (count: number) =>
      `${count} photo${count !== 1 ? 's' : ''} captured`,
    syncedGoogle: 'Synced with Google',
    storedLocally: 'Stored Locally',
    syncedAccountSub: (email: string) => `Linked to ${email}`,
    storedLocallySub: '100% free without sign-in! Photos saved in browser.',
    connectGoogle: 'Connect',
    downloadAll: 'Download All',
    clearGallery: 'Clear Gallery',
    noPhotosYet: 'No photos yet',
    noPhotosYetSub: 'Click the camera shutter button to capture your first photo!',
    viewingPhoto: 'Viewing Photo',
    deleteConfirm: 'Are you sure you want to delete all photos from the gallery?',

    googleModalTitle: 'Google OAuth & Cloud',
    googleOAuthTitle: 'Google OAuth & Cloud',
    googleModalSub: 'Optional gallery sync',
    googleOAuthSub: 'Optional gallery sync',
    googleFreeNoticeTitle: 'autophoto is 100% free with no login required!',
    googleFreeNotice: 'autophoto is 100% free with no login required!',
    googleFreeNoticeSub:
      'You can take photos, apply filters, generate 3x4 sheets and download without an account. Connecting with Google is optional to sync your online gallery.',
    googleAccountLabel: 'Google account for sync:',
    googleAccountForSync: 'Google account for sync:',
    googleConnectBtn: 'Sign In with Google',
    connectedActive: 'Active',
    allPhotosSyncedNotice: 'All captured photos are synced with your profile.',
    syncedAccountActive: 'All captured photos are synced with your profile.',
    disconnectBtn: 'Disconnect',
    disconnect: 'Disconnect',
    advancedClientId: 'Advanced Client ID setup',

    helpTitle: 'How to use autophoto',
    helpSub: 'Quick guide for 3x4 ID photos & effects',
    helpDocTitle: '3x4 Photos for ID Documents',
    helpDocPoints: [
      'Use the dashed guideline to align eyes and chin perfectly.',
      'Stand against a light-colored wall with soft front lighting.',
      'After taking the picture, click 3x4 Sheet to download a ready-to-print sheet with 6 copies and crop marks!',
    ],
    helpDocItem1: 'Use the dashed guideline to align eyes and chin perfectly.',
    helpDocItem2: 'Stand against a light-colored wall with soft front lighting.',
    helpDocItem3: 'After taking the picture, click 3x4 Sheet to download a ready-to-print sheet with 6 copies and crop marks!',
    helpFiltersTitle: 'Light & B&W Filters',
    helpFiltersBody:
      'Use High Light to brighten dark webcams with a studio look, Low Light for moody tones, and B&W for timeless monochrome shots.',
    helpFiltersDesc:
      'Use High Light to brighten dark webcams with a studio look, Low Light for moody tones, and B&W for timeless monochrome shots.',
    helpStickersTitle: 'Fun Stickers & Props',
    helpStickersBody:
      'Tap any sticker to place it on screen. Drag them anywhere on the viewfinder to fit your face, or drag down to the trash zone to delete!',
    helpStickersDesc:
      'Tap any sticker to place it on screen. Drag them anywhere on the viewfinder to fit your face, or drag down to the trash zone to delete!',
    helpUnderstoodBtn: 'Got it, let’s go!',
    helpGotIt: 'Got it, let’s go!',

    adSponsored: 'Sponsored',
    adRefreshIn: 'Refreshes in',
    adClose: 'Close',
  },

  es: {
    tagline: 'Fotos 3x4 y Filtros Divertidos',
    badge: 'Webcam Toy',
    gallery: 'Galería',
    login: 'Acceder',
    connected: 'Conectado',
    help: 'Consejos y Ayuda',
    soundOn: 'Activar sonidos',
    soundOff: 'Silenciar sonidos',
    languageSelect: 'Idioma',

    aspectDoc: 'Doc',
    aspectSquare: 'Cuad',
    aspectCamera: 'Cám',
    aspectWide: 'Wide',
    aspectStrip: 'Toy',
    guide3x4: 'Guía 3x4',
    gridGuide: 'Cuadrícula',
    mirror: 'Espejo',
    tripleShot: 'Ráfaga 3x',
    shutterAria: 'Tomar Foto',
    library: 'Biblioteca',

    basicFilters: 'Filtros Básicos',
    lightAdjustments: 'Ajustes de Luz',
    hideSliders: 'Ocultar Sliders',
    normal: 'Normal',
    bw: 'B&N',
    highLight: 'Alta Luz',
    lowLight: 'Baja Luz',
    moreFilters: '▼ Más filtros (Noir, Vintage, Cyber Pop, Invertido)',
    fewerFilters: '▲ Menos filtros',
    manualExposure: 'Ajustes Manuales de Exposición',
    brightness: 'Brillo',
    contrast: 'Contraste',
    reset: 'Restablecer',

    funStickers: 'Pegatinas Fun',
    clearStickers: 'Limpiar',
    dragTip: 'Arrastra las pegatinas por el visor para colocarlas',
    moreStickers: 'Más',
    capturePhoto: 'Tomar Foto / Descargar',
    capture3x4: 'Capturar Foto 3x4',
    dropToDelete: '¡Suelta para Eliminar!',
    dragHereToDelete: 'Arrastra aquí para Eliminar',
    stickerDeleted: '¡Pegatina eliminada!',
    stickerLibraryTitle: 'Biblioteca de Pegatinas',
    stickerLibrarySub: 'Toca para pegar en la cámara y arrastra por el visor',
    categoriesAll: 'Todos',
    categoriesAccessories: 'Accesorios',
    categoriesFace: 'Rostro',
    categoriesEmojis: 'Emojis',
    categories3x4: 'Sellos 3x4',
    categoriesRetro: 'Retro',

    photoCapturedSuccess: '¡Foto Capturada!',
    photoAutoSavedNotice: 'Guardada automáticamente en la galería',
    downloadPhoto: 'Descargar Foto',
    printSheet3x4: 'Plantilla 3x4 (Impresión)',
    generatingSheet: 'Armando Plantilla...',
    downloadSheetAction: 'Descargar Plantilla (6 Fotos 3x4)',
    backToPhoto: 'Volver',
    copy: 'Copiar',
    copied: '¡Copiado!',
    share: 'Compartir',
    viewInGallery: 'Ver en Galería',
    newPhoto: 'Nueva Foto',
    standard3x4Tag: 'Estándar 3x4',

    yourGallery: 'Tu Galería',
    photosSavedCount: (count: number) =>
      `${count} foto${count !== 1 ? 's' : ''} guardada${count !== 1 ? 's' : ''}`,
    syncedGoogle: 'Sincronizado en Google',
    storedLocally: 'Guardado en el Navegador',
    syncedAccountSub: (email: string) => `Vinculado a ${email}`,
    storedLocallySub: '¡100% gratuito sin iniciar sesión! Fotos guardadas localmente.',
    connectGoogle: 'Conectar',
    downloadAll: 'Descargar Todas',
    clearGallery: 'Vaciar Galería',
    noPhotosYet: 'Aún no hay fotos',
    noPhotosYetSub: '¡Haz clic en el disparador de la cámara para capturar tu primera foto!',
    viewingPhoto: 'Visualizando Foto',
    deleteConfirm: '¿Seguro que deseas eliminar todas las fotos de la galería?',

    googleModalTitle: 'Google OAuth y Nube',
    googleOAuthTitle: 'Google OAuth y Nube',
    googleModalSub: 'Sincronización de galería opcional',
    googleOAuthSub: 'Sincronización de galería opcional',
    googleFreeNoticeTitle: '¡autophoto es 100% gratis y no requiere login!',
    googleFreeNotice: '¡autophoto es 100% gratis y no requiere login!',
    googleFreeNoticeSub:
      'Puedes tomar fotos, aplicar filtros, generar plantillas 3x4 y descargarlas sin crear una cuenta. Conectar con Google es opcional si deseas sincronizar tu galería en la nube.',
    googleAccountLabel: 'Cuenta de Google para sincronizar:',
    googleAccountForSync: 'Cuenta de Google para sincronizar:',
    googleConnectBtn: 'Conectar con Google',
    connectedActive: 'Activo',
    allPhotosSyncedNotice: 'Todas las fotos tomadas están vinculadas a tu perfil.',
    syncedAccountActive: 'Todas as fotos tomadas estão vinculadas a tu perfil.',
    disconnectBtn: 'Desconectar',
    disconnect: 'Desconectar',
    advancedClientId: 'Configuración avanzada de Client ID',

    helpTitle: 'Cómo usar autophoto',
    helpSub: 'Guía rápida para fotos de carnet 3x4 y efectos',
    helpDocTitle: 'Fotos 3x4 para Documentos',
    helpDocPoints: [
      'Usa la línea punteada para alinear ojos y barbilla.',
      'Colócate frente a una pared clara con iluminación frontal suave.',
      'Tras tomar la foto, haz clic en Plantilla 3x4 para descargar una hoja con 6 fotos y guías de corte listas para imprimir.',
    ],
    helpDocItem1: 'Usa la línea punteada para alinear ojos y barbilla.',
    helpDocItem2: 'Colócate frente a una pared clara con iluminación frontal suave.',
    helpDocItem3: 'Tras tomar la foto, haz clic en Plantilla 3x4 para descargar una hoja con 6 fotos y guías de corte listas para imprimir.',
    helpFiltersTitle: 'Filtros de Luz y B&N',
    helpFiltersBody:
      'Usa Alta Luz para aclarar webcams oscuras o dar aspecto de estudio, Baja Luz para un tono íntimo y B&N para fotos monocromáticas clásicas.',
    helpFiltersDesc:
      'Usa Alta Luz para aclarar webcams oscuras o dar aspecto de estudio, Baja Luz para un tono íntimo y B&N para fotos monocromáticas clásicas.',
    helpStickersTitle: 'Pegatinas y Accesorios',
    helpStickersBody:
      'Toca las pegatinas para añadirlas a la pantalla. ¡Puedes arrastrarlas libremente por el visor para encajarlas en tu cara o soltarlas en la papelera para eliminarlas!',
    helpStickersDesc:
      'Toca las pegatinas para añadirlas a la pantalla. ¡Puedes arrastrarlas libremente por el visor para encajarlas en tu cara o soltarlas en la papelera para eliminarlas!',
    helpUnderstoodBtn: '¡Entendido, vamos!',
    helpGotIt: '¡Entendido, vamos!',

    adSponsored: 'Patrocinado',
    adRefreshIn: 'Se actualiza en',
    adClose: 'Cerrar',
  },
};
