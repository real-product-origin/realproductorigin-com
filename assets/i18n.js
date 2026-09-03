// Marketing-site string table, for copy that is built in JavaScript.
//
// Most of this site is static HTML, which translates by having a translated
// file under /de/, /ja/ and so on. But several pages build user-facing
// sentences in code — /history.html alone writes twenty of them ("Also
// possible", "High confidence", "Page 1 of 3", "checked 3 times since…") —
// and a translated copy of the markup does nothing for a string that lives
// in a <script>. Those pages could not be translated at all until this
// existed.
//
// Usage:
//
//     RPOi18n.t("hist_alsoPossible")            // -> "Also possible"
//     RPOi18n.t("hist_pageOf", "2", "3")        // -> "Page 2 of 3"
//
// Rules that matter:
//
//   * ENGLISH IS THE FALLBACK, per key, not per language. A missing or
//     untranslated key renders the English sentence rather than a blank or
//     a raw key — a half-translated page is bad, an empty one is broken.
//   * Placeholders are {0}, {1} — positional, because word order moves
//     between languages and a concatenation cannot.
//   * The locale comes from <html lang>, the same source the language
//     switcher reads, so there is one answer to "what language is this".
//
// Dependency-free, loaded with `defer` alongside lang-switcher.js.

(function () {
  "use strict";

  var STRINGS = {
    en: {
      // ── /history.html ────────────────────────────────────────────────
      hist_gateSignIn: "Sign in to manage your history.",
      hist_signIn: "Sign in",
      hist_all: "All",
      hist_everything: "Everything",
      hist_manageLists: "Manage lists",
      hist_newListName: "New list name",
      hist_createList: "Create",
      hist_save: "Save",
      hist_delete: "Delete",
      hist_noLists: "No lists yet. Name one below.",
      hist_confirmDeleteList: "Delete this list and everything in it? This can't be undone.",
      hist_inLists: "In your lists",
      hist_products: "Products",
      hist_brands: "Brands",
      hist_selectAll: "Select all on this page",
      hist_selected: "{0} selected",
      hist_deleteSelected: "Delete selected",
      hist_newer: "‹ Newer",
      hist_older: "Older ›",
      hist_pageOf: "Page {0} of {1} · {2} saved",
      hist_nothingYet: "Nothing saved yet.",
      hist_nothingHere: "Nothing here — try another filter.",
      hist_deleteAll: "Delete my entire history",
      hist_confirmMany:
        "Delete {0} rows? This cannot be undone.",
      hist_confirmOne: "Delete this row? This cannot be undone.",
      hist_confirmAll:
        "Delete your entire history? This cannot be undone.",
      hist_checks: "{0} checks",
      hist_product: "Product",
      hist_brand: "Brand",
      hist_madeIn: "Made in",
      hist_owner: "Owner",
      hist_notEstablished: "Not established",

      // The modal
      hist_productScore: "Product score",
      hist_brandReport: "Brand report",
      hist_fieldBrand: "Brand",
      hist_fieldSeller: "Seller of record",
      hist_fieldScoredOn: "Scored on",
      hist_fieldWebsite: "Website",
      hist_asShownOn: "The answer as shown on {0}.",
      hist_asShownChecked:
        "The answer as shown on {0} — checked {1} times since {2}.",
      hist_theFourAnswers: "The four answers",
      hist_shipsFrom: "Ships from",
      hist_retailer: "Retailer",
      hist_moneyGoesTo: "Money goes to",
      hist_alsoPossible: "Also possible: {0}",
      hist_checkedByPerson: "checked by a person",
      hist_confHigh: "High confidence ({0})",
      hist_confModerate: "Moderate confidence ({0})",
      hist_confLow: "Low confidence ({0})",
      hist_confVeryLow: "Very low confidence ({0})",
      hist_theListing: "The listing",
      hist_ultimateParent: "Ultimate parent",
      hist_howWeGotThere: "How we got there",
      hist_sources: "Sources · {0}",
      hist_notFound: "Not found:",
      hist_openProduct: "Open the product page",
      hist_openWebsite: "Open their website",
      hist_checkAgain: "Check again",
      hist_deleteRow: "Delete this row",
      hist_diagnostic: "Diagnostic {0}",
      hist_loading: "Loading…",
      hist_couldNotOpen: "We could not open that one.",
      hist_thinProduct:
        "This one was saved before we started keeping the full answer, so "
        + "only the headline was recorded. Score it again and the next entry "
        + "will have everything — all four indicators, the reasoning and "
        + "every source.",
      hist_thinBrand:
        "This one was saved before we started keeping the full report, so "
        + "only the headline was recorded. Check the brand again and the next "
        + "entry will have everything.",

      // Evidence tiers, shared with the brand report
      tier_record: "On the record",
      tier_measured: "What we've checked",
      tier_assessed: "Our assessment",
      tier_reported: "What people report",

      // ── /brands.html ─────────────────────────────────────────────────
      brand_gate:
        "Sign in to look up a brand. Free accounts get five brand checks.",
      brand_unrecognised:
        "We couldn't identify a brand from that. Try the company name, or "
        + "its website.",
      brand_rateLimited:
        "Too many lookups just now — try again in a minute.",
      brand_looking: "Looking…",
      brand_disagree:
        "<strong>These disagree.</strong> The name is registered in {0}; we "
        + "believe the company is {1}. One brand in four looks local on "
        + "paper and isn't.",
      brand_withheld:
        "You have used all your brand checks. The public record above is "
        + "always free — our assessment of who owns the company needs an "
        + "upgrade.",
      brand_seePlans: "See plans",
      brand_quotaLifetime: "{0} of {1} brand checks used.",
      brand_quotaMonthly: "{0} of {1} brand checks used this month.",
      brand_unknownOwner: "Unknown owner",
      brand_untitled: "Untitled",
      brand_histOn: "On — we're keeping a list for you.",
      brand_histOff: "Off — we're keeping no record of what you check.",
    },

    "de": {
    hist_gateSignIn: "Melden Sie sich an, um Ihren Verlauf zu verwalten.",
    hist_signIn: "Anmelden",
    hist_all: "Alle",
    hist_everything: "Alles",
    hist_manageLists: "Listen verwalten",
    hist_newListName: "Name der neuen Liste",
    hist_createList: "Anlegen",
    hist_save: "Speichern",
    hist_delete: "Löschen",
    hist_noLists: "Noch keine Listen. Benennen Sie unten eine.",
    hist_confirmDeleteList: "Diese Liste und alles darin löschen? Das lässt sich nicht rückgängig machen.",
    hist_inLists: "In Ihren Listen",
    hist_products: "Produkte",
    hist_brands: "Marken",
    hist_selectAll: "Alle auf dieser Seite auswählen",
    hist_selected: "{0} ausgewählt",
    hist_deleteSelected: "Auswahl löschen",
    hist_newer: "‹ Neuer",
    hist_older: "Älter ›",
    hist_pageOf: "Seite {0} von {1} · {2} gespeichert",
    hist_nothingYet: "Noch nichts gespeichert.",
    hist_nothingHere: "Hier ist nichts — probieren Sie einen anderen Filter.",
    hist_deleteAll: "Meinen gesamten Verlauf löschen",
    hist_confirmMany: "{0} Einträge löschen? Das lässt sich nicht rückgängig machen.",
    hist_confirmOne: "Diesen Eintrag löschen? Das lässt sich nicht rückgängig machen.",
    hist_confirmAll: "Ihren gesamten Verlauf löschen? Das lässt sich nicht rückgängig machen.",
    hist_checks: "{0} Prüfungen",
    hist_product: "Produkt",
    hist_brand: "Marke",
    hist_madeIn: "Hergestellt in",
    hist_owner: "Eigentümer",
    hist_notEstablished: "Nicht ermittelt",

    hist_productScore: "Produktbewertung",
    hist_brandReport: "Markenbericht",
    hist_fieldBrand: "Marke",
    hist_fieldSeller: "Verkäufer",
    hist_fieldScoredOn: "Bewertet auf",
    hist_fieldWebsite: "Website",
    hist_asShownOn: "Die Antwort, wie sie am {0} angezeigt wurde.",
    hist_asShownChecked: "Die Antwort, wie sie am {0} angezeigt wurde — {1}-mal geprüft seit {2}.",
    hist_theFourAnswers: "Die vier Antworten",
    hist_shipsFrom: "Versand aus",
    hist_retailer: "Händler",
    hist_moneyGoesTo: "Geld fließt nach",
    hist_alsoPossible: "Ebenfalls möglich: {0}",
    hist_checkedByPerson: "von einer Person geprüft",
    hist_confHigh: "Hohe Zuverlässigkeit ({0})",
    hist_confModerate: "Mittlere Zuverlässigkeit ({0})",
    hist_confLow: "Geringe Zuverlässigkeit ({0})",
    hist_confVeryLow: "Sehr geringe Zuverlässigkeit ({0})",
    hist_theListing: "Das Angebot",
    hist_ultimateParent: "Oberste Muttergesellschaft",
    hist_howWeGotThere: "Wie wir darauf kommen",
    hist_sources: "Quellen · {0}",
    hist_notFound: "Nicht gefunden:",
    hist_openProduct: "Produktseite öffnen",
    hist_openWebsite: "Website öffnen",
    hist_checkAgain: "Erneut prüfen",
    hist_deleteRow: "Diesen Eintrag löschen",
    hist_diagnostic: "Diagnose {0}",
    hist_loading: "Wird geladen…",
    hist_couldNotOpen: "Dieser Eintrag konnte nicht geöffnet werden.",
    hist_thinProduct: "Dieser Eintrag wurde gespeichert, bevor wir die vollständige Antwort aufbewahrt haben — nur die Kernaussage wurde festgehalten. Bewerten Sie das Produkt erneut, und der nächste Eintrag enthält alles: alle vier Indikatoren, die Begründung und jede Quelle.",
    hist_thinBrand: "Dieser Eintrag wurde gespeichert, bevor wir den vollständigen Bericht aufbewahrt haben — nur die Kernaussage wurde festgehalten. Prüfen Sie die Marke erneut, und der nächste Eintrag enthält alles.",

    tier_record: "Amtlich belegt",
    tier_measured: "Von uns geprüft",
    tier_assessed: "Unsere Einschätzung",
    tier_reported: "Was Nutzer berichten",

    brand_gate: "Melden Sie sich an, um eine Marke zu prüfen. Kostenlose Konten erhalten fünf Markenprüfungen.",
    brand_unrecognised: "Wir konnten daraus keine Marke erkennen. Versuchen Sie den Firmennamen oder die Website.",
    brand_rateLimited: "Zu viele Abfragen gerade eben — versuchen Sie es in einer Minute erneut.",
    brand_looking: "Wird gesucht…",
    brand_disagree: "<strong>Das widerspricht sich.</strong> Der Name ist in {0} eingetragen; wir gehen davon aus, dass das Unternehmen in {1} sitzt. Jede vierte Marke wirkt auf dem Papier lokal und ist es nicht.",
    brand_withheld: "Sie haben alle Markenprüfungen aufgebraucht. Die öffentlichen Einträge oben sind immer kostenlos — unsere Einschätzung, wem das Unternehmen gehört, erfordert ein Upgrade.",
    brand_seePlans: "Tarife ansehen",
    brand_quotaLifetime: "{0} von {1} Markenprüfungen genutzt.",
    brand_quotaMonthly: "{0} von {1} Markenprüfungen diesen Monat genutzt.",
    brand_unknownOwner: "Eigentümer unbekannt",
    brand_untitled: "Ohne Titel",
    brand_histOn: "An — wir führen eine Liste für Sie.",
    brand_histOff: "Aus — wir zeichnen nicht auf, was Sie prüfen.",
    },

    "es": {
    hist_gateSignIn: "Inicie sesión para gestionar su historial.",
    hist_signIn: "Iniciar sesión",
    hist_all: "Todo",
    hist_everything: "Todo",
    hist_manageLists: "Gestionar listas",
    hist_newListName: "Nombre de la nueva lista",
    hist_createList: "Crear",
    hist_save: "Guardar",
    hist_delete: "Eliminar",
    hist_noLists: "Aún no hay listas. Cree una abajo.",
    hist_confirmDeleteList: "¿Eliminar esta lista y todo su contenido? No se puede deshacer.",
    hist_inLists: "En sus listas",
    hist_products: "Productos",
    hist_brands: "Marcas",
    hist_selectAll: "Seleccionar todo en esta página",
    hist_selected: "{0} seleccionados",
    hist_deleteSelected: "Eliminar seleccionados",
    hist_newer: "‹ Más recientes",
    hist_older: "Más antiguos ›",
    hist_pageOf: "Página {0} de {1} · {2} guardados",
    hist_nothingYet: "Todavía no hay nada guardado.",
    hist_nothingHere: "Aquí no hay nada — pruebe otro filtro.",
    hist_deleteAll: "Eliminar todo mi historial",
    hist_confirmMany: "¿Eliminar {0} filas? Esto no se puede deshacer.",
    hist_confirmOne: "¿Eliminar esta fila? Esto no se puede deshacer.",
    hist_confirmAll: "¿Eliminar todo su historial? Esto no se puede deshacer.",
    hist_checks: "{0} consultas",
    hist_product: "Producto",
    hist_brand: "Marca",
    hist_madeIn: "Fabricado en",
    hist_owner: "Propietario",
    hist_notEstablished: "No determinado",

    hist_productScore: "Puntuación del producto",
    hist_brandReport: "Informe de marca",
    hist_fieldBrand: "Marca",
    hist_fieldSeller: "Vendedor registrado",
    hist_fieldScoredOn: "Puntuado en",
    hist_fieldWebsite: "Sitio web",
    hist_asShownOn: "La respuesta tal como se mostró el {0}.",
    hist_asShownChecked: "La respuesta tal como se mostró el {0} — consultada {1} veces desde el {2}.",
    hist_theFourAnswers: "Las cuatro respuestas",
    hist_shipsFrom: "Se envía desde",
    hist_retailer: "Minorista",
    hist_moneyGoesTo: "El dinero va a",
    hist_alsoPossible: "También posible: {0}",
    hist_checkedByPerson: "verificado por una persona",
    hist_confHigh: "Confianza alta ({0})",
    hist_confModerate: "Confianza media ({0})",
    hist_confLow: "Confianza baja ({0})",
    hist_confVeryLow: "Confianza muy baja ({0})",
    hist_theListing: "El anuncio",
    hist_ultimateParent: "Matriz última",
    hist_howWeGotThere: "Cómo llegamos ahí",
    hist_sources: "Fuentes · {0}",
    hist_notFound: "No encontrado:",
    hist_openProduct: "Abrir la página del producto",
    hist_openWebsite: "Abrir su sitio web",
    hist_checkAgain: "Consultar de nuevo",
    hist_deleteRow: "Eliminar esta fila",
    hist_diagnostic: "Diagnóstico {0}",
    hist_loading: "Cargando…",
    hist_couldNotOpen: "No pudimos abrir esa entrada.",
    hist_thinProduct: "Esta entrada se guardó antes de que empezáramos a conservar la respuesta completa, así que solo se registró el titular. Vuelva a puntuarlo y la próxima entrada lo tendrá todo: los cuatro indicadores, el razonamiento y todas las fuentes.",
    hist_thinBrand: "Esta entrada se guardó antes de que empezáramos a conservar el informe completo, así que solo se registró el titular. Consulte la marca de nuevo y la próxima entrada lo tendrá todo.",

    tier_record: "Registro público",
    tier_measured: "Lo que hemos comprobado",
    tier_assessed: "Nuestra evaluación",
    tier_reported: "Lo que dice la gente",

    brand_gate: "Inicie sesión para consultar una marca. Las cuentas gratuitas incluyen cinco consultas de marca.",
    brand_unrecognised: "No hemos podido identificar una marca a partir de eso. Pruebe con el nombre de la empresa o su sitio web.",
    brand_rateLimited: "Demasiadas consultas ahora mismo — inténtelo de nuevo en un minuto.",
    brand_looking: "Buscando…",
    brand_disagree: "<strong>Esto no coincide.</strong> El nombre está registrado en {0}; creemos que la empresa está en {1}. Una de cada cuatro marcas parece local sobre el papel y no lo es.",
    brand_withheld: "Ha agotado sus consultas de marca. El registro público de arriba siempre es gratuito — nuestra evaluación de quién posee la empresa requiere una mejora de plan.",
    brand_seePlans: "Ver planes",
    brand_quotaLifetime: "{0} de {1} consultas de marca usadas.",
    brand_quotaMonthly: "{0} de {1} consultas de marca usadas este mes.",
    brand_unknownOwner: "Propietario desconocido",
    brand_untitled: "Sin título",
    brand_histOn: "Activado — estamos guardando una lista para usted.",
    brand_histOff: "Desactivado — no registramos lo que consulta.",
    },

    "fr": {
    hist_gateSignIn: "Connectez-vous pour gérer votre historique.",
    hist_signIn: "Se connecter",
    hist_all: "Tout",
    hist_everything: "Tout",
    hist_manageLists: "Gérer les listes",
    hist_newListName: "Nom de la nouvelle liste",
    hist_createList: "Créer",
    hist_save: "Enregistrer",
    hist_delete: "Supprimer",
    hist_noLists: "Aucune liste pour l’instant. Nommez-en une ci-dessous.",
    hist_confirmDeleteList: "Supprimer cette liste et tout ce qu’elle contient ? C’est irréversible.",
    hist_inLists: "Dans vos listes",
    hist_products: "Produits",
    hist_brands: "Marques",
    hist_selectAll: "Tout sélectionner sur cette page",
    hist_selected: "{0} sélectionnés",
    hist_deleteSelected: "Supprimer la sélection",
    hist_newer: "‹ Plus récents",
    hist_older: "Plus anciens ›",
    hist_pageOf: "Page {0} sur {1} · {2} enregistrés",
    hist_nothingYet: "Rien d'enregistré pour l'instant.",
    hist_nothingHere: "Rien ici — essayez un autre filtre.",
    hist_deleteAll: "Supprimer tout mon historique",
    hist_confirmMany: "Supprimer {0} lignes ? Cette action est irréversible.",
    hist_confirmOne: "Supprimer cette ligne ? Cette action est irréversible.",
    hist_confirmAll: "Supprimer tout votre historique ? Cette action est irréversible.",
    hist_checks: "{0} vérifications",
    hist_product: "Produit",
    hist_brand: "Marque",
    hist_madeIn: "Fabriqué en",
    hist_owner: "Propriétaire",
    hist_notEstablished: "Non établi",

    hist_productScore: "Note du produit",
    hist_brandReport: "Rapport de marque",
    hist_fieldBrand: "Marque",
    hist_fieldSeller: "Vendeur officiel",
    hist_fieldScoredOn: "Noté sur",
    hist_fieldWebsite: "Site web",
    hist_asShownOn: "La réponse telle qu'affichée le {0}.",
    hist_asShownChecked: "La réponse telle qu'affichée le {0} — vérifiée {1} fois depuis le {2}.",
    hist_theFourAnswers: "Les quatre réponses",
    hist_shipsFrom: "Expédié depuis",
    hist_retailer: "Revendeur",
    hist_moneyGoesTo: "L'argent va en",
    hist_alsoPossible: "Également possible : {0}",
    hist_checkedByPerson: "vérifié par une personne",
    hist_confHigh: "Confiance élevée ({0})",
    hist_confModerate: "Confiance moyenne ({0})",
    hist_confLow: "Confiance faible ({0})",
    hist_confVeryLow: "Confiance très faible ({0})",
    hist_theListing: "L'annonce",
    hist_ultimateParent: "Société mère ultime",
    hist_howWeGotThere: "Comment nous y sommes arrivés",
    hist_sources: "Sources · {0}",
    hist_notFound: "Introuvable :",
    hist_openProduct: "Ouvrir la page produit",
    hist_openWebsite: "Ouvrir leur site web",
    hist_checkAgain: "Vérifier à nouveau",
    hist_deleteRow: "Supprimer cette ligne",
    hist_diagnostic: "Diagnostic {0}",
    hist_loading: "Chargement…",
    hist_couldNotOpen: "Nous n'avons pas pu ouvrir cette entrée.",
    hist_thinProduct: "Cette entrée a été enregistrée avant que nous conservions la réponse complète : seul l'essentiel a été noté. Notez-le à nouveau et la prochaine entrée contiendra tout — les quatre indicateurs, le raisonnement et chaque source.",
    hist_thinBrand: "Cette entrée a été enregistrée avant que nous conservions le rapport complet : seul l'essentiel a été noté. Vérifiez la marque à nouveau et la prochaine entrée contiendra tout.",

    tier_record: "Documents officiels",
    tier_measured: "Ce que nous avons vérifié",
    tier_assessed: "Notre évaluation",
    tier_reported: "Ce que rapportent les gens",

    brand_gate: "Connectez-vous pour vérifier une marque. Les comptes gratuits disposent de cinq vérifications de marque.",
    brand_unrecognised: "Nous n'avons pas pu identifier de marque à partir de cela. Essayez le nom de l'entreprise ou son site web.",
    brand_rateLimited: "Trop de recherches à l'instant — réessayez dans une minute.",
    brand_looking: "Recherche…",
    brand_disagree: "<strong>Ces éléments se contredisent.</strong> Le nom est déposé en {0} ; nous pensons que l'entreprise est en {1}. Une marque sur quatre paraît locale sur le papier sans l'être.",
    brand_withheld: "Vous avez utilisé toutes vos vérifications de marque. Les documents publics ci-dessus restent gratuits — notre évaluation du propriétaire réel nécessite une formule supérieure.",
    brand_seePlans: "Voir les formules",
    brand_quotaLifetime: "{0} vérifications de marque sur {1} utilisées.",
    brand_quotaMonthly: "{0} vérifications de marque sur {1} utilisées ce mois-ci.",
    brand_unknownOwner: "Propriétaire inconnu",
    brand_untitled: "Sans titre",
    brand_histOn: "Activé — nous tenons une liste pour vous.",
    brand_histOff: "Désactivé — nous n'enregistrons pas ce que vous vérifiez.",
    },

    "ja": {
    hist_gateSignIn: "履歴を管理するにはサインインしてください。",
    hist_signIn: "サインイン",
    hist_all: "すべて",
    hist_everything: "すべて",
    hist_manageLists: "リストを管理",
    hist_newListName: "新しいリスト名",
    hist_createList: "作成",
    hist_save: "保存",
    hist_delete: "削除",
    hist_noLists: "まだリストがありません。下で名前を付けてください。",
    hist_confirmDeleteList: "このリストと中身をすべて削除しますか？元に戻せません。",
    hist_inLists: "登録中のリスト",
    hist_products: "製品",
    hist_brands: "ブランド",
    hist_selectAll: "このページのすべてを選択",
    hist_selected: "{0}件を選択中",
    hist_deleteSelected: "選択した項目を削除",
    hist_newer: "‹ 新しい",
    hist_older: "古い ›",
    hist_pageOf: "{1}ページ中{0}ページ · {2}件を保存",
    hist_nothingYet: "まだ何も保存されていません。",
    hist_nothingHere: "該当なし — 別のフィルターをお試しください。",
    hist_deleteAll: "履歴をすべて削除",
    hist_confirmMany: "{0}件を削除しますか？この操作は取り消せません。",
    hist_confirmOne: "この項目を削除しますか？この操作は取り消せません。",
    hist_confirmAll: "履歴をすべて削除しますか？この操作は取り消せません。",
    hist_checks: "{0}回チェック",
    hist_product: "製品",
    hist_brand: "ブランド",
    hist_madeIn: "製造国",
    hist_owner: "所有者",
    hist_notEstablished: "特定できず",

    hist_productScore: "製品スコア",
    hist_brandReport: "ブランドレポート",
    hist_fieldBrand: "ブランド",
    hist_fieldSeller: "販売者",
    hist_fieldScoredOn: "スコア取得元",
    hist_fieldWebsite: "ウェブサイト",
    hist_asShownOn: "{0}時点で表示された回答です。",
    hist_asShownChecked: "{0}時点で表示された回答です — {2}以降{1}回チェックしました。",
    hist_theFourAnswers: "4つの回答",
    hist_shipsFrom: "発送元",
    hist_retailer: "リテーラー",
    hist_moneyGoesTo: "お金の流れ先",
    hist_alsoPossible: "他の可能性: {0}",
    hist_checkedByPerson: "人による確認済み",
    hist_confHigh: "信頼度：高 ({0})",
    hist_confModerate: "信頼度：中 ({0})",
    hist_confLow: "信頼度：低 ({0})",
    hist_confVeryLow: "信頼度：非常に低い ({0})",
    hist_theListing: "商品情報",
    hist_ultimateParent: "最終的な親会社",
    hist_howWeGotThere: "判断の根拠",
    hist_sources: "出典 · {0}",
    hist_notFound: "見つかりませんでした：",
    hist_openProduct: "商品ページを開く",
    hist_openWebsite: "ウェブサイトを開く",
    hist_checkAgain: "もう一度チェック",
    hist_deleteRow: "この項目を削除",
    hist_diagnostic: "診断 {0}",
    hist_loading: "読み込み中…",
    hist_couldNotOpen: "この項目を開けませんでした。",
    hist_thinProduct: "この項目は、当社が回答全体を保存するようになる前に保存されたため、要点のみが記録されています。もう一度スコアリングすると、次の項目には4つの指標、判断の根拠、すべての出典が含まれます。",
    hist_thinBrand: "この項目は、当社がレポート全体を保存するようになる前に保存されたため、要点のみが記録されています。もう一度ブランドをチェックすると、次の項目にはすべてが含まれます。",

    tier_record: "公的記録",
    tier_measured: "当社が確認した内容",
    tier_assessed: "当社の評価",
    tier_reported: "利用者の報告",

    brand_gate: "ブランドを調べるにはサインインしてください。無料アカウントでは5回のブランドチェックをご利用いただけます。",
    brand_unrecognised: "そこからブランドを特定できませんでした。会社名またはウェブサイトをお試しください。",
    brand_rateLimited: "現在リクエストが多すぎます — 1分ほどおいて再度お試しください。",
    brand_looking: "検索中…",
    brand_disagree: "<strong>内容が食い違っています。</strong>商標は{0}で登録されていますが、当社は運営会社が{1}にあると考えています。4社に1社は書類上は現地企業に見えて、実際には違います。",
    brand_withheld: "ブランドチェックをすべて使い切りました。上記の公的記録は常に無料です — 実際の所有者に関する当社の評価にはアップグレードが必要です。",
    brand_seePlans: "プランを見る",
    brand_quotaLifetime: "ブランドチェック{1}回中{0}回を使用。",
    brand_quotaMonthly: "今月はブランドチェック{1}回中{0}回を使用。",
    brand_unknownOwner: "所有者不明",
    brand_untitled: "タイトルなし",
    brand_histOn: "オン — リストを保存しています。",
    brand_histOff: "オフ — チェック内容は記録していません。",
    },

    "zh-Hans": {
    hist_gateSignIn: "登录后即可管理您的记录。",
    hist_signIn: "登录",
    hist_all: "全部",
    hist_everything: "全部",
    hist_manageLists: "管理清单",
    hist_newListName: "新清单名称",
    hist_createList: "创建",
    hist_save: "保存",
    hist_delete: "删除",
    hist_noLists: "还没有清单。请在下方创建一个。",
    hist_confirmDeleteList: "删除此清单及其中的全部内容？此操作无法撤销。",
    hist_inLists: "已加入的清单",
    hist_products: "商品",
    hist_brands: "品牌",
    hist_selectAll: "选择本页全部",
    hist_selected: "已选 {0} 项",
    hist_deleteSelected: "删除所选",
    hist_newer: "‹ 较新",
    hist_older: "较旧 ›",
    hist_pageOf: "第 {0} 页，共 {1} 页 · 已保存 {2} 条",
    hist_nothingYet: "还没有保存任何内容。",
    hist_nothingHere: "这里没有内容 — 试试其他筛选条件。",
    hist_deleteAll: "删除我的全部记录",
    hist_confirmMany: "删除 {0} 条记录？此操作无法撤销。",
    hist_confirmOne: "删除这条记录？此操作无法撤销。",
    hist_confirmAll: "删除您的全部记录？此操作无法撤销。",
    hist_checks: "查询 {0} 次",
    hist_product: "商品",
    hist_brand: "品牌",
    hist_madeIn: "制造地",
    hist_owner: "所有者",
    hist_notEstablished: "无法确定",

    hist_productScore: "商品评分",
    hist_brandReport: "品牌报告",
    hist_fieldBrand: "品牌",
    hist_fieldSeller: "销售方",
    hist_fieldScoredOn: "评分来源",
    hist_fieldWebsite: "网站",
    hist_asShownOn: "这是 {0} 当时显示的答案。",
    hist_asShownChecked: "这是 {0} 当时显示的答案 — 自 {2} 起共查询 {1} 次。",
    hist_theFourAnswers: "四个答案",
    hist_shipsFrom: "发货地",
    hist_retailer: "零售商",
    hist_moneyGoesTo: "资金流向",
    hist_alsoPossible: "也有可能：{0}",
    hist_checkedByPerson: "已由人工核实",
    hist_confHigh: "高可信度（{0}）",
    hist_confModerate: "中等可信度（{0}）",
    hist_confLow: "低可信度（{0}）",
    hist_confVeryLow: "极低可信度（{0}）",
    hist_theListing: "商品信息",
    hist_ultimateParent: "最终母公司",
    hist_howWeGotThere: "我们如何得出结论",
    hist_sources: "来源 · {0}",
    hist_notFound: "未找到：",
    hist_openProduct: "打开商品页面",
    hist_openWebsite: "打开其网站",
    hist_checkAgain: "重新查询",
    hist_deleteRow: "删除这条记录",
    hist_diagnostic: "诊断 {0}",
    hist_loading: "加载中…",
    hist_couldNotOpen: "无法打开该记录。",
    hist_thinProduct: "这条记录保存于我们开始留存完整答案之前，因此只记录了结论。重新评分后，下一条记录将包含全部内容：四项指标、判断依据和每一个来源。",
    hist_thinBrand: "这条记录保存于我们开始留存完整报告之前，因此只记录了结论。重新查询该品牌后，下一条记录将包含全部内容。",

    tier_record: "官方记录",
    tier_measured: "我们已核查的内容",
    tier_assessed: "我们的评估",
    tier_reported: "用户反映",

    brand_gate: "登录后即可查询品牌。免费账户可进行五次品牌查询。",
    brand_unrecognised: "我们无法据此识别品牌。请尝试输入公司名称或其网站。",
    brand_rateLimited: "当前查询过于频繁 — 请一分钟后重试。",
    brand_looking: "查询中…",
    brand_disagree: "<strong>两者不一致。</strong>该名称注册在{0}；但我们认为公司位于{1}。每四个品牌中就有一个在纸面上看似本地企业，实际并非如此。",
    brand_withheld: "您的品牌查询次数已用完。上方的公开记录始终免费 — 若要查看我们对实际所有者的评估，需要升级套餐。",
    brand_seePlans: "查看套餐",
    brand_quotaLifetime: "已使用 {1} 次品牌查询中的 {0} 次。",
    brand_quotaMonthly: "本月已使用 {1} 次品牌查询中的 {0} 次。",
    brand_unknownOwner: "所有者不详",
    brand_untitled: "无标题",
    brand_histOn: "已开启 — 我们正在为您保存记录。",
    brand_histOff: "已关闭 — 我们不会记录您查询的内容。",
    },

    "zh-Hant": {
    hist_gateSignIn: "登入後即可管理您的記錄。",
    hist_signIn: "登入",
    hist_all: "全部",
    hist_everything: "全部",
    hist_manageLists: "管理清單",
    hist_newListName: "新清單名稱",
    hist_createList: "建立",
    hist_save: "儲存",
    hist_delete: "刪除",
    hist_noLists: "還沒有清單。請在下方建立一個。",
    hist_confirmDeleteList: "刪除此清單及其中的全部內容？此操作無法復原。",
    hist_inLists: "已加入的清單",
    hist_products: "商品",
    hist_brands: "品牌",
    hist_selectAll: "選擇本頁全部",
    hist_selected: "已選 {0} 項",
    hist_deleteSelected: "刪除所選",
    hist_newer: "‹ 較新",
    hist_older: "較舊 ›",
    hist_pageOf: "第 {0} 頁，共 {1} 頁 · 已儲存 {2} 筆",
    hist_nothingYet: "尚未儲存任何內容。",
    hist_nothingHere: "這裡沒有內容 — 試試其他篩選條件。",
    hist_deleteAll: "刪除我的全部記錄",
    hist_confirmMany: "刪除 {0} 筆記錄？此操作無法復原。",
    hist_confirmOne: "刪除這筆記錄？此操作無法復原。",
    hist_confirmAll: "刪除您的全部記錄？此操作無法復原。",
    hist_checks: "查詢 {0} 次",
    hist_product: "商品",
    hist_brand: "品牌",
    hist_madeIn: "製造地",
    hist_owner: "所有者",
    hist_notEstablished: "無法確定",

    hist_productScore: "商品評分",
    hist_brandReport: "品牌報告",
    hist_fieldBrand: "品牌",
    hist_fieldSeller: "銷售方",
    hist_fieldScoredOn: "評分來源",
    hist_fieldWebsite: "網站",
    hist_asShownOn: "這是 {0} 當時顯示的答案。",
    hist_asShownChecked: "這是 {0} 當時顯示的答案 — 自 {2} 起共查詢 {1} 次。",
    hist_theFourAnswers: "四個答案",
    hist_shipsFrom: "發貨地",
    hist_retailer: "零售商",
    hist_moneyGoesTo: "資金流向",
    hist_alsoPossible: "也有可能：{0}",
    hist_checkedByPerson: "已由人工核實",
    hist_confHigh: "高可信度（{0}）",
    hist_confModerate: "中等可信度（{0}）",
    hist_confLow: "低可信度（{0}）",
    hist_confVeryLow: "極低可信度（{0}）",
    hist_theListing: "商品資訊",
    hist_ultimateParent: "最終母公司",
    hist_howWeGotThere: "我們如何得出結論",
    hist_sources: "來源 · {0}",
    hist_notFound: "未找到：",
    hist_openProduct: "開啟商品頁面",
    hist_openWebsite: "開啟其網站",
    hist_checkAgain: "重新查詢",
    hist_deleteRow: "刪除這筆記錄",
    hist_diagnostic: "診斷 {0}",
    hist_loading: "載入中…",
    hist_couldNotOpen: "無法開啟該記錄。",
    hist_thinProduct: "這筆記錄儲存於我們開始留存完整答案之前，因此只記錄了結論。重新評分後，下一筆記錄將包含全部內容：四項指標、判斷依據和每一個來源。",
    hist_thinBrand: "這筆記錄儲存於我們開始留存完整報告之前，因此只記錄了結論。重新查詢該品牌後，下一筆記錄將包含全部內容。",

    tier_record: "官方記錄",
    tier_measured: "我們已核查的內容",
    tier_assessed: "我們的評估",
    tier_reported: "使用者反映",

    brand_gate: "登入後即可查詢品牌。免費帳戶可進行五次品牌查詢。",
    brand_unrecognised: "我們無法據此識別品牌。請嘗試輸入公司名稱或其網站。",
    brand_rateLimited: "目前查詢過於頻繁 — 請一分鐘後重試。",
    brand_looking: "查詢中…",
    brand_disagree: "<strong>兩者不一致。</strong>該名稱註冊在{0}；但我們認為公司位於{1}。每四個品牌中就有一個在紙面上看似本地企業，實際並非如此。",
    brand_withheld: "您的品牌查詢次數已用完。上方的公開記錄始終免費 — 若要查看我們對實際所有者的評估，需要升級方案。",
    brand_seePlans: "查看方案",
    brand_quotaLifetime: "已使用 {1} 次品牌查詢中的 {0} 次。",
    brand_quotaMonthly: "本月已使用 {1} 次品牌查詢中的 {0} 次。",
    brand_unknownOwner: "所有者不詳",
    brand_untitled: "無標題",
    brand_histOn: "已開啟 — 我們正在為您儲存記錄。",
    brand_histOff: "已關閉 — 我們不會記錄您查詢的內容。",
    },
  };

  var LANG_PREFIX_RE = /^\/(fr|de|es|ja|zh-Hans|zh-Hant)\//;

  /* Same rule as lang-switcher.js: <html lang> is the single answer to
   * "what language is this page". Kept in step deliberately — two ways to
   * detect a locale is two ways to disagree about it. */
  function currentLang() {
    var tag = document.documentElement.getAttribute("lang") || "en";
    if (/^zh/i.test(tag)) return /hant/i.test(tag) ? "zh-Hant" : "zh-Hans";
    return tag.toLowerCase().split("-")[0];
  }

  var lang = currentLang();

  function t(key) {
    var table = STRINGS[lang] || {};
    // Per-KEY fallback, not per-language: a locale that has been half
    // translated shows English for what it is missing, rather than a blank
    // where a sentence should be.
    var s = table[key];
    if (s === undefined) s = STRINGS.en[key];
    if (s === undefined) return "";
    for (var i = 1; i < arguments.length; i++) {
      s = s.split("{" + (i - 1) + "}").join(String(arguments[i]));
    }
    return s;
  }

  /* Confidence as a word, in one place. Every surface that shows a score
   * uses the same four bands; duplicating the thresholds is how one of them
   * ends up calling 74% "high". */
  function confidenceKey(n) {
    if (typeof n !== "number") return null;
    if (n >= 75) return "hist_confHigh";
    if (n >= 50) return "hist_confModerate";
    if (n >= 25) return "hist_confLow";
    return "hist_confVeryLow";
  }

  window.RPOi18n = {
    t: t,
    lang: lang,
    confidenceKey: confidenceKey,
    // All six locales live in this file. They were briefly six separate
    // files loaded by a `document.write` shim, which is fragile and blocked
    // in some contexts for the sake of ~25KB. `register` stays for anything
    // added at runtime later.
    register: function (code, table) {
      STRINGS[code] = Object.assign({}, STRINGS[code] || {}, table || {});
    },
    // For the coverage check: which keys exist, and which a locale is
    // missing. A missing key is not an error at runtime, so it needs to be
    // visible somewhere that is not the page.
    _keys: function () { return Object.keys(STRINGS.en); },
    _missing: function (code) {
      var have = STRINGS[code] || {};
      return Object.keys(STRINGS.en).filter(function (k) {
        return have[k] === undefined;
      });
    },
  };
})();
