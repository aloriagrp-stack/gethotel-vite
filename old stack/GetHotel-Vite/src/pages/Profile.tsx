

import { useAuth } from "@/context/AuthContext";
import { useLocale, languages, currencies } from "@/context/LocaleContext";
import { 
    User, Mail, Phone, MapPin, 
    CreditCard, ShieldCheck, 
    Settings, HelpCircle, 
    FileText, Compass, 
    ChevronRight, Globe, 
    Bell, History, Sparkles,
    Navigation, LocateFixed, LogOut,
    Lock, Heart, Cookie
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";
import { useNavigate as useRouter } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [savedCards, setSavedCards] = useState<any[]>([]);
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCard, setNewCard] = useState({ name: '', number: '', expiry: '', cvv: '' });
    const [error, setError] = useState<string | null>(null);
    
    // Profile Data State
    const [profileData, setProfileData] = useState({
        name: user?.name || "Premium Guest",
        phone: "",
        location: ""
    });
    const [initialProfileData, setInitialProfileData] = useState({
        name: user?.name || "Premium Guest",
        phone: "",
        location: ""
    });
    const [nameLastUpdated, setNameLastUpdated] = useState<number>(0);
    const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'info' | 'error', text: string} | null>(null);
    const [heroName, setHeroName] = useState(user?.name || "Premium Guest");

    // Language & Preference State (using global LocaleContext)
    const { langCode, currency, changeLanguage: globalChangeLanguage, changeCurrency: globalChangeCurrency } = useLocale();
    const currentLanguage = languages.find(l => l.code === langCode) || { name: "English", flag: "🇺🇸", code: "en" };
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);
    
    const [notifications, setNotifications] = useState({
        push: true,
        email: true,
        sms: false,
        offers: true
    });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        logout();
        setShowLogoutConfirm(false);
    };



    const translations: Record<string, Record<string, string>> = {
        en: {
            payment: "Payment Info", manage: "Manage Account", pref: "Preferences", activity: "Travel Activity", help: "Help & Support", legal: "Legal & Privacy",
            saved: "Saved Cards", billing: "Billing History", credits: "Travel Credits", profile: "Profile Details", login: "Login & Security", data: "Data & Privacy",
            lang: "Language", curr: "Currency: INR", notify: "Notifications", bookings: "My Bookings", wishlist: "Wishlist", rewards: "Reward Points",
            support: "Contact Support", center: "Help Center", safety: "Safety Resources", terms: "Terms & Conditions", privacy: "Privacy Policy", cookie: "Cookie Policy",
            update: "Update Profile", logout: "Log Out", verified: "Verified", back: "Back", add_card: "Add New Card", no_cards: "No Saved Cards",
            card_holder: "Card Holder", expires: "Expires", billing_desc: "Manage your cards and billing history.", saved_methods: "Saved Payment Methods",
            no_transactions: "No Transactions Yet", booking_desc: "All your bookings will appear here.",
            personal_info: "Update your personal information for a better experience.", full_name: "Full Name", email: "Email Address", phone: "Phone Number", location: "Location",
            change_pass: "Change Password", current_pass: "Current Password", new_pass: "New Password", update_pass: "Update Password",
            tfa: "Two-Factor Authentication", tfa_desc: "Add an extra layer of security to your account.",
            privacy_desc: "Manage your data and privacy settings.", download_data: "Download Your Data", download_desc: "Get a copy of all your account activity and history.",
            danger_zone: "Danger Zone", delete_desc: "Permanently delete your account and all associated data. This action cannot be undone.", delete_account: "Delete Account",
            card_number: "Card Number", expiry_date: "Expiry Date", save_card: "Save Card Details", cancel: "Cancel", security_desc: "Keep your account safe and secure.", privacy_manage: "Manage your data and privacy settings.",
            push_notify: "Push Notifications", email_notify: "Email Notifications", sms_notify: "SMS Notifications", offers_notify: "Special Offers",
            push_desc: "Receive real-time alerts on your device.", email_desc: "Get travel updates and receipts via email.", sms_desc: "Direct alerts to your mobile phone.", offers_desc: "Exclusive deals and travel inspiration.",
            select_currency: "Select Currency", currency_desc: "All prices will be shown in your selected currency."
        },
        hi: {
            payment: "भुगतान जानकारी", manage: "खाता प्रबंधित करें", pref: "वरीयताएँ", activity: "यात्रा गतिविधि", help: "सहायता और समर्थन", legal: "कानूनी और गोपनीयता",
            saved: "सहेजे गए कार्ड", billing: "बिलिंग इतिहास", credits: "यात्रा क्रेडिट", profile: "प्रोफ़ाइल विवरण", login: "लॉगिन और सुरक्षा", data: "डेटा और गोपनीयता",
            lang: "भाषा", curr: "मुद्रा: INR", notify: "सूचनाएं", bookings: "मेरी बुकिंग", wishlist: "विशलिस्ट", rewards: "इनाम अंक",
            support: "सहायता से संपर्क करें", center: "सहायता केंद्र", safety: "सुरक्षा संसाधन", terms: "सेवा की शर्तें", privacy: "गोपनीयता नीति", cookie: "कुकी नीति",
            update: "प्रोफ़ाइल अपडेट करें", logout: "लॉग आउट करें", verified: "सत्यापित", back: "पीछे", add_card: "नया कार्ड जोड़ें", no_cards: "कोई कार्ड नहीं",
            card_holder: "कार्ड धारक", expires: "वैधता", billing_desc: "अपने कार्ड और बिलिंग इतिहास को प्रबंधित करें।", saved_methods: "सहेजे गए भुगतान के तरीके",
            no_transactions: "अभी तक कोई लेनदेन नहीं", booking_desc: "आपकी सारी बुकिंग यहाँ दिखाई देंगी।",
            personal_info: "बेहतर अनुभव के लिए अपनी व्यक्तिगत जानकारी अपडेट करें।", full_name: "पूरा नाम", email: "ईमेल पता", phone: "फ़ोन नंबर", location: "स्थान",
            change_pass: "पासवर्ड बदलें", current_pass: "वर्तमान पासवर्ड", new_pass: "नया पासवर्ड", update_pass: "पासवर्ड अपडेट करें",
            tfa: "दो-कारक प्रमाणीकरण", tfa_desc: "अपने खाते में सुरक्षा की एक अतिरिक्त परत जोड़ें।",
            privacy_desc: "अपने डेटा और गोपनीयता सेटिंग्स प्रबंधित करें।", download_data: "अपना डेटा डाउनलोड करें", download_desc: "अपनी सभी खाता गतिविधि और इतिहास की एक प्रति प्राप्त करें।",
            danger_zone: "खतरे का क्षेत्र", delete_desc: "अपना खाता और सभी संबंधित डेटा स्थायी रूप से हटा दें। यह क्रिया वापस नहीं ली जा सकती।", delete_account: "खाता हटाएं",
            card_number: "कार्ड नंबर", expiry_date: "समाप्ति तिथि", save_card: "कार्ड विवरण सहेजें", cancel: "रद्द करें", security_desc: "अपने खाते को सुरक्षित रखें।", privacy_manage: "अपने डेटा और गोपनीयता सेटिंग्स प्रबंधित करें।",
            push_notify: "पुश सूचनाएं", email_notify: "ईमेल सूचनाएं", sms_notify: "SMS सूचनाएं", offers_notify: "विशेष ऑफर",
            push_desc: "अपने डिवाइस पर रीयल-टाइम अलर्ट प्राप्त करें।", email_desc: "ईमेल के माध्यम से यात्रा अपडेट और रसीदें प्राप्त करें।", sms_desc: "अपने मोबाइल फोन पर सीधे अलर्ट।", offers_desc: "विशेष सौदे और यात्रा प्रेरणा।",
            select_currency: "मुद्रा चुनें", currency_desc: "सभी कीमतें आपकी चुनी हुई मुद्रा में दिखाई जाएंगी।"
        },
        de: {
            payment: "Zahlungsinfo", manage: "Konto verwalten", pref: "Präferenzen", activity: "Reiseaktivität", help: "Hilfe & Support", legal: "Rechtliches",
            saved: "Gespeicherte Karten", billing: "Rechnungsverlauf", credits: "Reiseguthaben", profile: "Profil-Details", login: "Login & Sicherheit", data: "Daten & Privatsphäre",
            lang: "Sprache", curr: "Währung: INR", notify: "Benachrichtigungen", bookings: "Meine Buchungen", wishlist: "Wunschliste", rewards: "Bonuspunkte",
            support: "Support kontaktieren", center: "Hilfezentrum", safety: "Sicherheitsressourcen", terms: "AGB", privacy: "Datenschutzerklärung", cookie: "Cookie-Richtlinie",
            update: "Profil aktualisieren", logout: "Abmelden", verified: "Verifiziert", back: "Zurück", add_card: "Karte hinzufügen", no_cards: "Keine Karten",
            card_holder: "Karteninhaber", expires: "Gültig bis", billing_desc: "Verwalten Sie Ihre Karten und Ihren Rechnungsverlauf.", saved_methods: "Gespeicherte Zahlungsmethoden",
            no_transactions: "Noch keine Transaktionen", booking_desc: "Alle Ihre Buchungen werden hier angezeigt.",
            personal_info: "Aktualisieren Sie Ihre persönlichen Daten für ein besseres Erlebnis.", full_name: "Vollständiger Name", email: "E-Mail-Adresse", phone: "Telefonnummer", location: "Standort",
            change_pass: "Passwort ändern", current_pass: "Aktuelles Passwort", new_pass: "Neues Passwort", update_pass: "Passwort aktualisieren",
            tfa: "Zwei-Faktor-Authentifizierung", tfa_desc: "Fügen Sie Ihrem Konto eine zusätzliche Sicherheitsebene hinzu.",
            privacy_desc: "Verwalten Sie Ihre Daten- und Privatsphäre-Einstellungen.", download_data: "Daten herunterladen", download_desc: "Holen Sie sich eine Kopie aller Ihrer Kontoaktivitäten.",
            danger_zone: "Gefahrenzone", delete_desc: "Löschen Sie Ihr Konto und alle zugehörigen Daten dauerhaft. Dies kann nicht rückgängig gemacht werden.", delete_account: "Konto löschen",
            card_number: "Kartennummer", expiry_date: "Ablaufdatum", cvv: "CVV", save_card: "Kartendaten speichern", cancel: "Abbrechen", security_desc: "Halten Sie Ihr Konto sicher.", privacy_manage: "Verwalten Sie Ihre Daten- und Privatsphäre-Einstellungen."
        },
        ja: {
            payment: "支払い情報", manage: "アカウント管理", pref: "設定", activity: "旅行履歴", help: "ヘルプとサポート", legal: "法的情報",
            saved: "保存済みカード", billing: "請求履歴", credits: "トラベルクレジット", profile: "プロフィール詳細", login: "ログインとセキュリティ", data: "データとプライバシー",
            lang: "言語", curr: "通貨: INR", notify: "通知", bookings: "予約済み", wishlist: "ウィッシュリスト", rewards: "リワードポイント",
            support: "サポートに連絡", center: "ヘルプセンター", safety: "安全リソース", terms: "利用規約", privacy: "プライバシーポリシー", cookie: "クッキーポリシー",
            update: "プロフィールを更新", logout: "ログアウト", verified: "認証済み", back: "戻る", add_card: "カードを追加", no_cards: "カードなし",
            card_holder: "カード名義人", expires: "有効期限", billing_desc: "カードと請求履歴を管理します。", saved_methods: "保存済みの支払い方法",
            no_transactions: "まだ取引はありません", booking_desc: "すべての予約がここに表示されます。",
            personal_info: "より良い体験のために個人情報を更新してください。", full_name: "フルネーム", email: "メールアドレス", phone: "電話番号", location: "所在地",
            change_pass: "パスワード変更", current_pass: "現在のパスワード", new_pass: "新しいパスワード", update_pass: "パスワードを更新",
            tfa: "2要素認証", tfa_desc: "アカウントにセキュリティ層を追加します。",
            privacy_desc: "データとプライバシーの設定を管理します。", download_data: "データをダウンロード", download_desc: "すべてのアカウントアクティビティのコピーを取得します。",
            danger_zone: "デンジャーゾーン", delete_desc: "アカウントと関連データを完全に削除します。この操作は取り消せません。", delete_account: "アカウント削除"
        },
        fr: {
            payment: "Infos de paiement", manage: "Gérer le compte", pref: "Préférences", activity: "Activité de voyage", help: "Aide & Support", legal: "Légal & Confidentialité",
            saved: "Cartes enregistrées", billing: "Historique", credits: "Crédits voyage", profile: "Détails du profil", login: "Sécurité", data: "Données & Vie privée",
            lang: "Langue", curr: "Devise: INR", notify: "Notifications", bookings: "Mes réservations", wishlist: "Liste de souhaits", rewards: "Points de récompense",
            support: "Contacter le support", center: "Centre d'aide", safety: "Ressources de sécurité", terms: "Conditions", privacy: "Politique de Confidentialité", cookie: "Cookies",
            update: "Mettre à jour", logout: "Déconnexion", verified: "Vérifié", back: "Retour", add_card: "Ajouter une carte", no_cards: "Aucune carte",
            card_holder: "Titulaire de la carte", expires: "Expire le", billing_desc: "Gérez vos cartes et votre historique de facturation.", saved_methods: "Méthodes de paiement enregistrées",
            no_transactions: "Aucune transaction pour le moment", booking_desc: "Toutes vos réservations apparaîtront ici.",
            personal_info: "Mettez à jour vos informations personnelles pour une meilleure expérience.", full_name: "Nom complet", email: "Adresse e-mail", phone: "Numéro de téléphone", location: "Localisation",
            change_pass: "Modifier le mot de passe", current_pass: "Mot de passe actuel", new_pass: "Nouveau mot de passe", update_pass: "Mettre à jour le mot de passe",
            tfa: "Authentification à deux facteurs", tfa_desc: "Ajoutez une couche de sécurité supplémentaire à votre compte.",
            privacy_desc: "Gérez vos paramètres de données et de confidentialité.", download_data: "Télécharger vos données", download_desc: "Obtenez une copie de toute votre activité.",
            danger_zone: "Zone de danger", delete_desc: "Supprimez définitivement votre compte et toutes les données associées. Cette action est irréversible.", delete_account: "Supprimer le compte",
            card_number: "Numéro de carte", expiry_date: "Date d'expiration", save_card: "Enregistrer la carte", cancel: "Annuler", security_desc: "Gardez votre compte en sécurité.", privacy_manage: "Gérez vos données et votre confidentialité."
        },
        es: {
            payment: "Información de pago", manage: "Gestionar cuenta", pref: "Preferencias", activity: "Actividad de viaje", help: "Ayuda y soporte", legal: "Legal y privacidad",
            saved: "Tarjetas guardadas", billing: "Historial de facturación", credits: "Créditos de viaje", profile: "Detalles del perfil", login: "Seguridad", data: "Datos y privacidad",
            lang: "Idioma", curr: "Moneda: INR", notify: "Notificaciones", bookings: "Mis reservas", wishlist: "Lista de deseos", rewards: "Puntos de recompensa",
            support: "Contactar soporte", center: "Centro de ayuda", safety: "Recursos de seguridad", terms: "Términos", privacy: "Política de Privacidad", cookie: "Cookies",
            update: "Actualizar perfil", logout: "Cerrar sesión", verified: "Verificado", back: "Volver", add_card: "Añadir tarjeta", no_cards: "Sin tarjetas",
            card_holder: "Titular de la tarjeta", expires: "Expira", billing_desc: "Gestiona tus tarjetas y el historial de facturación.", saved_methods: "Métodos de pago guardados",
            no_transactions: "Aún no hay transacciones", booking_desc: "Todas sus reservas aparecerán aquí.",
            personal_info: "Actualice su información personal para una mejor experiencia.", full_name: "Nombre completo", email: "Correo electrónico", phone: "Número de teléfono", location: "Ubicación",
            change_pass: "Cambiar contraseña", current_pass: "Contraseña actual", new_pass: "Nueva contraseña", update_pass: "Actualizar contraseña",
            tfa: "Autenticación de dos factores", tfa_desc: "Añade una capa extra de seguridad a tu cuenta.",
            privacy_desc: "Gestiona tus datos y ajustes de privacidad.", download_data: "Descargar tus datos", download_desc: "Obtén una copia de toda tu actividad.",
            danger_zone: "Zona de peligro", delete_desc: "Elimina permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.", delete_account: "Eliminar cuenta",
            card_number: "Número de tarjeta", expiry_date: "Fecha de vencimiento", save_card: "Guardar tarjeta", cancel: "Cancelar", security_desc: "Mantén tu cuenta segura.", privacy_manage: "Gestiona tus datos y privacidad."
        },
        zh: {
            payment: "支付信息", manage: "管理账户", pref: "偏好设置", activity: "旅行活动", help: "帮助与支持", legal: "法律与隐私",
            saved: "已保存的卡片", billing: "账单历史", credits: "旅行积分", profile: "个人资料详情", login: "登录与安全", data: "数据与隐私",
            lang: "语言", curr: "货币: INR", notify: "通知", bookings: "我的预订", wishlist: "愿望清单", rewards: "奖励积分",
            support: "联系支持", center: "帮助中心", safety: "安全资源", terms: "服务条款", privacy: "隐私政策", cookie: "Cookie 政策",
            update: "更新资料", logout: "退出登录", verified: "已验证", back: "返回", add_card: "添加新卡", no_cards: "暂无卡片"
        },
        ar: {
            payment: "معلومات الدفع", manage: "إدارة الحساب", pref: "التفضيلات", activity: "نشاط السفر", help: "المساعدة والدعم", legal: "القانونية والخصوصية",
            saved: "البطاقات المحفوظة", billing: "سجل الفواتير", credits: "رصيد السفر", profile: "تفاصيل الملف الشخصي", login: "الأمان", data: "البيانات والخصوصية",
            lang: "اللغة", curr: "العملة: INR", notify: "الإشعارات", bookings: "حجوزاتي", wishlist: "قائمة الرغبات", rewards: "نقاط المكافأة",
            support: "اتصل بالدعم", center: "مركز المساعدة", safety: "موارد الأمان", terms: "شروط الخدمة", privacy: "سياسة الخصوصية", cookie: "سياسة الكوكيز",
            update: "تحديث الملف", logout: "تسجيل الخروج", verified: "موثق", back: "رجوع", add_card: "إضافة بطاقة", no_cards: "لا توجد بطاقات"
        },
        ru: {
            payment: "Платежная информация", manage: "Управление аккаунтом", pref: "Настройки", activity: "История поездок", help: "Помощь и поддержка", legal: "Юридическая информация",
            saved: "Сохраненные карты", billing: "История платежей", credits: "Бонусы", profile: "Данные профиля", login: "Безопасность", data: "Конфиденциальность",
            lang: "Язык", curr: "Валюта: INR", notify: "Уведомления", bookings: "Мои бронирования", wishlist: "Список желаний", rewards: "Баллы",
            support: "Связаться с поддержкой", center: "Справочный центр", safety: "Ресурсы безопасности", terms: "Условия", privacy: "Политика конфиденциальности", cookie: "Cookies",
            update: "Обновить профиль", logout: "Выйти", verified: "Подтвержден", back: "Назад", add_card: "Добавить карту", no_cards: "Нет карт"
        },
        pt: {
            payment: "Info de pagamento", manage: "Gerenciar conta", pref: "Preferências", activity: "Atividade de viagem", help: "Ajuda e suporte", legal: "Legal e privacidade",
            saved: "Cartões salvos", billing: "Histórico de fatura", credits: "Créditos de viagem", profile: "Detalhes do perfil", login: "Segurança", data: "Dados e privacidade",
            lang: "Idioma", curr: "Moeda: INR", notify: "Notificações", bookings: "Minhas reservas", wishlist: "Lista de desejos", rewards: "Pontos",
            support: "Contatar suporte", center: "Centro de ajuda", safety: "Recursos de segurança", terms: "Termos", privacy: "Política de Privacidade", cookie: "Cookies",
            update: "Atualizar perfil", logout: "Sair", verified: "Verificado", back: "Voltar", add_card: "Adicionar cartão", no_cards: "Sem cartões"
        }
    };

    const t = (key: string) => {
        return translations[currentLanguage.code]?.[key] || translations['en'][key] || key;
    };

    const changeLanguage = (lang: any) => {
        globalChangeLanguage(lang.code);
        setShowLanguageModal(false);
        setStatusMessage({ type: 'success', text: `Language changed to ${lang.name}! ✨` });
        setTimeout(() => setStatusMessage(null), 3000);
    };

    const changeCurrency = async (curr: any) => {
        await globalChangeCurrency(curr);
        setShowCurrencyModal(false);
        setStatusMessage({ type: 'success', text: `Currency changed to ${curr.code} (${curr.symbol})! 💰` });
        setTimeout(() => setStatusMessage(null), 3000);
    };

    const handleUpdateProfile = async () => {
        // Phone validation (10 digits)
        if (profileData.phone && !/^\d{10}$/.test(profileData.phone)) {
            setStatusMessage({ type: 'error', text: "Please enter a valid 10-digit phone number." });
            return;
        }

        // Change detection
        const hasChanged = JSON.stringify(profileData) !== JSON.stringify(initialProfileData);
        
        if (!hasChanged) {
            setStatusMessage({ type: 'info', text: "You haven't changed anything in the profile." });
            return;
        }

        // Name Change Constraint (1 Year)
        if (profileData.name !== initialProfileData.name) {
            const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
            const timePassed = Date.now() - nameLastUpdated;
            
            if (nameLastUpdated !== 0 && timePassed < oneYearInMs) {
                const daysLeft = Math.ceil((oneYearInMs - timePassed) / (24 * 60 * 60 * 1000));
                setStatusMessage({ type: 'error', text: `You can change your name again in ${daysLeft} days.` });
                return;
            }
            
            // Trigger Typewriter Animation
            await animateNameChange(profileData.name);
            setNameLastUpdated(Date.now());
        }

        setInitialProfileData({...profileData});
        setStatusMessage({ type: 'success', text: "Profile updated successfully! ✨" });

        // Auto-hide message
        setTimeout(() => setStatusMessage(null), 3000);
    };

    const animateNameChange = async (newName: string) => {
        const currentName = heroName;
        // Erase
        for (let i = currentName.length; i >= 0; i--) {
            setHeroName(currentName.substring(0, i));
            await new Promise(r => setTimeout(r, 30));
        }
        // Type
        for (let i = 0; i <= newName.length; i++) {
            setHeroName(newName.substring(0, i));
            await new Promise(r => setTimeout(r, 50));
        }
    };

    const fetchCurrentLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    const address = data.address.city || data.address.town || data.address.village || data.address.state || "Unknown Location";
                    setProfileData({...profileData, location: address});
                } catch (err) {
                    setStatusMessage({ type: 'error', text: "Failed to fetch location." });
                }
            });
        }
    };

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value.replace(/[^0-9]/gi, '');
        }
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            const month = v.substring(0, 2);
            const year = v.substring(2, 4);
            return `${month} / ${year}`;
        }
        return v;
    };

    const validateExpiry = (expiry: string) => {
        const [monthStr, yearStr] = expiry.split(' / ');
        const month = parseInt(monthStr);
        const year = parseInt(yearStr);
        
        if (!month || !year) return false;
        if (month < 1 || month > 12) return "Invalid Month (01-12)";
        
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return "Card has expired!";
        }
        return null;
    };

    const handleSaveCard = (e: React.FormEvent) => {
        e.preventDefault();
        const expiryError = validateExpiry(newCard.expiry);
        if (expiryError) {
            setError(expiryError);
            return;
        }

        if (newCard.name && newCard.number.length >= 19) {
            setSavedCards([...savedCards, { ...newCard, id: Date.now() }]);
            setIsAddingCard(false);
            setNewCard({ name: '', number: '', expiry: '', cvv: '' });
            setError(null);
        } else {
            setError("Please fill all details correctly.");
        }
    };

    useEffect(() => {
        if (!loading && !user) {
            router("/login?redirect=/profile");
        }
    }, [user, loading, router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F0F7FF]">
            <History className="w-10 h-10 text-brand-600 animate-spin" />
        </div>
    );
    if (!user) return null;

    const sections = [
        {
            id: "manage",
            title: t('manage'),
            items: [
                { label: t('profile'), id: 'profile', desc: "Update your full name, location, and phone number", icon: User, iconBg: "bg-blue-500", iconColor: "text-white" },
                { label: t('login'), id: 'login', desc: "Change password and configure 2FA", icon: Lock, iconBg: "bg-amber-500", iconColor: "text-white" }
            ]
        },
        {
            id: "preferences",
            title: t('pref'),
            items: [
                { label: t('lang'), id: 'lang', desc: "Change website language", status: currentLanguage.name, icon: Globe, iconBg: "bg-emerald-500", iconColor: "text-white" },
                { label: t('curr').split(':')[0] || "Currency", id: 'curr', desc: "Select display currency", status: `${currency.code} (${currency.symbol})`, icon: CreditCard, iconBg: "bg-indigo-500", iconColor: "text-white" },
                { label: t('notify'), id: 'notify', desc: "Configure email and push notification settings", icon: Bell, iconBg: "bg-rose-500", iconColor: "text-white" }
            ]
        },
        {
            id: "travel",
            title: t('activity'),
            items: [
                { label: t('bookings'), id: 'bookings', desc: "Manage your active or past stay bookings", icon: History, iconBg: "bg-sky-500", iconColor: "text-white" },
                { label: t('wishlist'), id: 'wishlist', desc: "View your saved luxury hotel listings", icon: Heart, iconBg: "bg-pink-500", iconColor: "text-white" }
            ]
        },
        {
            id: "legal",
            title: "Support & Legal",
            items: [
                { label: t('support'), id: 'support', desc: "Get help regarding bookings or payments", icon: HelpCircle, iconBg: "bg-violet-500", iconColor: "text-white" },
                { label: t('terms'), id: 'terms', desc: "Read platform rules & guidelines", icon: FileText, iconBg: "bg-slate-500", iconColor: "text-white" },
                { label: t('privacy'), id: 'privacy', desc: "Understand how we protect your personal data", icon: ShieldCheck, iconBg: "bg-green-600", iconColor: "text-white" },
                { label: t('cookie'), id: 'cookie', desc: "Review browser tracking configurations", icon: Cookie, iconBg: "bg-orange-500", iconColor: "text-white" }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Hidden Google Translate Element */}
            <div id="google_translate_element" style={{ display: 'none' }} />
            <style>{`
                .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
                body { top: 0px !important; }
                .goog-te-menu-value:hover { text-decoration: none !important; }
                .goog-tooltip { display: none !important; }
                .goog-tooltip:hover { display: none !important; }
                .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
            `}</style>
            {/* Language Selection Modal */}
            <AnimatePresence>
                {showLanguageModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLanguageModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-8 border-b border-slate-50 bg-[#F0F7FF]/30">
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Select Language</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Website will be translated automatically.</p>
                            </div>
                            <div className="max-height-[60vh] overflow-y-auto p-4 custom-scrollbar">
                                <div className="grid grid-cols-1 gap-2">
                                    {languages.map((lang) => (
                                        <button 
                                            key={lang.code}
                                            onClick={() => changeLanguage(lang)}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-2xl transition-all group",
                                                currentLanguage.name === lang.name ? "bg-brand-50 border border-brand-100" : "hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl">{lang.flag}</span>
                                                <div className="text-left">
                                                    <p className="text-sm font-black text-slate-900">{lang.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{lang.native}</p>
                                                </div>
                                            </div>
                                            {currentLanguage.name === lang.name && (
                                                <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                                                    <Sparkles className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 text-center">
                                <button 
                                    onClick={() => setShowLanguageModal(false)}
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    Close Window
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Currency Selection Modal */}
            <AnimatePresence>
                {showCurrencyModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCurrencyModal(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-8 border-b border-slate-50 bg-[#F0F7FF]/30">
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{t('select_currency')}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('currency_desc')}</p>
                            </div>
                            <div className="max-height-[60vh] overflow-y-auto p-4 custom-scrollbar">
                                <div className="grid grid-cols-1 gap-2">
                                    {currencies.map((curr) => (
                                        <button 
                                            key={curr.code}
                                            onClick={() => changeCurrency(curr)}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-2xl transition-all group",
                                                currency.code === curr.code ? "bg-brand-50 border border-brand-100" : "hover:bg-slate-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-lg shadow-sm">
                                                    {curr.symbol}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-black text-slate-900">{curr.code}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{curr.name}</p>
                                                </div>
                                            </div>
                                            {currency.code === curr.code && (
                                                <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center">
                                                    <Sparkles className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 text-center">
                                <button 
                                    onClick={() => setShowCurrencyModal(false)}
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Notification */}
            <AnimatePresence>
                {statusMessage && (
                    <motion.div 
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 24, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none"
                    >
                        <div className={cn(
                            "px-8 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 pointer-events-auto",
                            statusMessage.type === 'success' ? "bg-emerald-500 border-emerald-400 text-white" : 
                            statusMessage.type === 'error' ? "bg-red-500 border-red-400 text-white" :
                            "bg-slate-900 border-slate-800 text-white"
                        )}>
                            {statusMessage.type === 'success' && <Sparkles className="w-5 h-5" />}
                            {statusMessage.type === 'error' && <Bell className="w-5 h-5" />}
                            {statusMessage.type === 'info' && <HelpCircle className="w-5 h-5" />}
                            <span className="text-xs font-black uppercase tracking-widest">{statusMessage.text}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Light Premium Header */}
            <div className="h-auto pb-6 md:pb-0 md:h-[350px] bg-[#F0F7FF] relative overflow-hidden border-b border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 via-transparent to-brand-100/30" />
                
                <div className="max-w-6xl mx-auto px-6 pt-12 md:pt-40 relative z-10">
                    <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-8">
                        {/* Profile Avatar - Premium */}
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative group"
                        >
                            <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 p-1 shadow-xl relative z-10">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative border-4 border-white">
                                    <span className="text-3xl md:text-5xl font-black text-brand-600 uppercase">
                                        {heroName.charAt(0)}
                                    </span>
                                </div>
                            </div>
                            {/* Status Badge */}
                            <div className="absolute -bottom-1 right-0 md:-right-1 bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg border-2 border-white z-20">
                                {t('verified')}
                            </div>
                        </motion.div>

                        <div className="flex-1 text-center md:text-left">
                            <motion.div 
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <h1 className="text-2xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-1 md:mb-2 min-h-[1.2em]">
                                    {heroName}
                                    <span className="animate-pulse ml-1 text-brand-400">|</span>
                                </h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4 mt-1 md:mt-0">
                                    <div className="flex items-center gap-1 md:gap-2 px-1">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[11px] md:text-sm font-bold text-slate-500">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1 md:gap-2 px-1">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">India</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 mt-4 md:mt-12">
                <AnimatePresence mode="wait">
                    {!activeTab ? (
                        <motion.div 
                            key="main-list"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="max-w-2xl mx-auto space-y-10 text-left"
                        >
                            {sections.map((section) => (
                                <div key={section.id} className="space-y-3">
                                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-4">
                                        {section.title}
                                    </h4>
                                    <div className="bg-white rounded-3xl border border-slate-100/80 shadow-sm overflow-hidden divide-y divide-slate-100">
                                        {section.items.map((item: any) => {
                                            const ItemIcon = item.icon;
                                            return (
                                                <button 
                                                    key={item.id} 
                                                    onClick={() => {
                                                        if (item.id === "profile") setActiveTab("profile-details");
                                                        if (item.id === "login") setActiveTab("login-security");
                                                        if (item.id === "lang") setShowLanguageModal(true);
                                                        if (item.id === "curr") setShowCurrencyModal(true);
                                                        if (item.id === "notify") setActiveTab("notifications");
                                                        if (item.id === "bookings") router("/my-bookings");
                                                        if (item.id === "wishlist") router("/wishlist");
                                                        if (item.id === "terms") router("/terms-&-conditions");
                                                        if (item.id === "privacy") router("/privacy");
                                                        if (item.id === "cookie") router("/cookies");
                                                        if (item.id === "support") router("/contact");
                                                    }}
                                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors text-left group cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0", item.iconBg)}>
                                                            <ItemIcon className={cn("w-5 h-5", item.iconColor)} />
                                                        </div>
                                                        <div>
                                                            <span className="text-[15px] font-semibold text-slate-800 group-hover:text-slate-950 transition-colors">
                                                                {item.label}
                                                            </span>
                                                            <span className="text-xs text-slate-400 font-normal mt-0.5 block leading-tight">
                                                                {item.desc}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {item.status && (
                                                            <span className="text-sm font-normal text-slate-400">
                                                                {item.status}
                                                            </span>
                                                        )}
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : activeTab === 'payment' ? (
                        <motion.div 
                            key="payment-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-2xl mx-auto space-y-8"
                        >
                            {/* Back Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => {
                                            setActiveTab(null);
                                            setIsAddingCard(false);
                                            setError(null);
                                        }}
                                        className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5 rotate-180" />
                                    </button>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 uppercase">{t('payment')}</h2>
                                        <p className="text-xs font-bold text-slate-400">{t('billing_desc')}</p>
                                    </div>
                                </div>
                                {!isAddingCard && (
                                    <button 
                                        onClick={() => setIsAddingCard(true)}
                                        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                                    >
                                        {t('add_card')}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                {/* Saved Cards Section */}
                                <div className="py-2">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-8">{t('saved')}</h3>
                                    
                                    <AnimatePresence mode="wait">
                                        {isAddingCard ? (
                                            <motion.form 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                onSubmit={handleSaveCard}
                                                className="space-y-6 bg-slate-50/50 p-8 rounded-2xl border border-slate-100"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Card Holder Name</label>
                                                        <input 
                                                            required
                                                            autoComplete="off"
                                                            name="ch_name"
                                                            placeholder="ARJUN MEHTA"
                                                            value={newCard.name}
                                                            onChange={e => setNewCard({...newCard, name: e.target.value.toUpperCase()})}
                                                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-brand-500 font-bold text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('card_number')}</label>
                                                        <input 
                                                            required
                                                            autoComplete="off"
                                                            name="cn_number"
                                                            placeholder="•••• •••• •••• ••••"
                                                            maxLength={19}
                                                            value={newCard.number}
                                                            onChange={e => setNewCard({...newCard, number: formatCardNumber(e.target.value)})}
                                                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-brand-500 font-bold text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('expiry_date')}</label>
                                                        <input 
                                                            required
                                                            autoComplete="off"
                                                            name="ce_date"
                                                            placeholder="MM / YY"
                                                            maxLength={7}
                                                            value={newCard.expiry}
                                                            onChange={e => {
                                                                const formatted = formatExpiry(e.target.value);
                                                                setNewCard({...newCard, expiry: formatted});
                                                                setError(null);
                                                            }}
                                                            className={cn(
                                                                "w-full px-5 py-4 bg-white border rounded-2xl outline-none focus:border-brand-500 font-bold text-sm",
                                                                error?.includes("Month") || error?.includes("expired") ? "border-red-500" : "border-slate-200"
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CVV</label>
                                                        <input 
                                                            required
                                                            type="password"
                                                            autoComplete="new-password"
                                                            name="cc_code"
                                                            placeholder="•••"
                                                            maxLength={3}
                                                            value={newCard.cvv}
                                                            onChange={e => setNewCard({...newCard, cvv: e.target.value.replace(/[^0-9]/g, '')})}
                                                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:border-brand-500 font-bold text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {error && (
                                                    <motion.p 
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center"
                                                    >
                                                        ⚠️ {error}
                                                    </motion.p>
                                                )}

                                                <div className="flex gap-4 pt-4">
                                                    <button type="submit" className="flex-1 btn-primary py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">{t('save_card')}</button>
                                                    <button type="button" onClick={() => {
                                                        setIsAddingCard(false);
                                                        setError(null);
                                                    }} className="flex-1 bg-white border border-slate-200 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors">{t('cancel')}</button>
                                                </div>
                                            </motion.form>
                                        ) : (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                            >
                                                {savedCards.length > 0 ? (
                                                    savedCards.map(card => (
                                                        <div key={card.id} className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl text-white relative overflow-hidden shadow-lg group">
                                                            <div className="relative z-10">
                                                                <div className="flex justify-between items-start mb-8">
                                                                    <div className="w-10 h-6 bg-amber-400/20 rounded-md border border-amber-400/30 flex items-center justify-center">
                                                                        <div className="w-6 h-4 bg-amber-400/40 rounded-sm" />
                                                                    </div>
                                                                    <CreditCard className="w-6 h-6 text-white/40" />
                                                                </div>
                                                                <p className="text-lg font-mono tracking-[0.25em] mb-4">
                                                                    {card.number}
                                                                </p>
                                                                <div className="flex justify-between items-end">
                                                                    <div>
                                                                        <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-1">{t('card_holder')}</p>
                                                                        <p className="text-xs font-black uppercase">{card.name}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-1">{t('expires')}</p>
                                                                        <p className="text-xs font-black">{card.expiry}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-full py-16 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center">
                                                        <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                                                            <CreditCard className="w-8 h-8 text-brand-300" />
                                                        </div>
                                                        <p className="text-slate-400 font-black text-lg mb-2">{t('no_cards')}</p>
                                                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Click "{t('add_card')}" to get started.</p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Billing History Section */}
                                <div className="py-2">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-8">{t('billing')}</h3>
                                    <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-50/50 border border-slate-100 rounded-2xl">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                                            <History className="w-10 h-10 text-slate-200" />
                                        </div>
                                        <h4 className="text-3xl font-black text-slate-300 mb-2">{t('no_transactions')}</h4>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('booking_desc')}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'profile-details' ? (
                        <motion.div 
                            key="profile-details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-2xl mx-auto space-y-8"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={() => setActiveTab(null)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase">{t('profile')}</h2>
                                    <p className="text-xs font-bold text-slate-400">{t('personal_info')}</p>
                                </div>
                            </div>

                            <div className="py-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('full_name')}</label>
                                        <input 
                                            value={profileData.name}
                                            onChange={e => setProfileData({...profileData, name: e.target.value})}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500 font-bold text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('email')}</label>
                                        <input disabled value={user.email} className="w-full px-6 py-4 bg-slate-100 border border-slate-200 rounded-2xl outline-none font-bold text-sm text-slate-400 cursor-not-allowed" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('phone')}</label>
                                        <input 
                                            placeholder="+91 98765 43210" 
                                            maxLength={10}
                                            value={profileData.phone}
                                            onChange={e => setProfileData({...profileData, phone: e.target.value.replace(/[^0-9]/g, '')})}
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500 font-bold text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('location')}</label>
                                        <div className="relative">
                                            <input 
                                                placeholder="New Delhi, India" 
                                                value={profileData.location}
                                                onChange={e => setProfileData({...profileData, location: e.target.value})}
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500 font-bold text-sm pr-14" 
                                            />
                                            <button 
                                                onClick={fetchCurrentLocation}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-sm text-brand-600 hover:bg-brand-50 transition-all border border-slate-100"
                                                title="Fetch My Location"
                                            >
                                                <LocateFixed className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 flex justify-end">
                                    <button 
                                        onClick={handleUpdateProfile}
                                        className="btn-primary px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                                    >
                                        {t('update')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'login-security' ? (
                        <motion.div 
                            key="login-security"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-2xl mx-auto space-y-8"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={() => setActiveTab(null)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase">{t('login')}</h2>
                                    <p className="text-xs font-bold text-slate-400">{t('security_desc')}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="py-2">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-8">{t('change_pass')}</h3>
                                    <div className="space-y-6 max-w-md">
                                        <input type="password" placeholder={t('current_pass')} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500 font-bold text-sm" />
                                        <input type="password" placeholder={t('new_pass')} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-brand-500 font-bold text-sm" />
                                        <button className="btn-primary w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">{t('update_pass')}</button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-6 bg-slate-50/40 border border-slate-100 rounded-2xl">
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-2">{t('tfa')}</h3>
                                        <p className="text-xs font-bold text-slate-400">{t('tfa_desc')}</p>
                                    </div>
                                    <div className="w-14 h-8 bg-slate-100 rounded-full relative cursor-pointer p-1">
                                        <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'notifications' ? (
                        <motion.div 
                            key="notifications-view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-2xl mx-auto space-y-8"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={() => setActiveTab(null)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase">{t('notify')}</h2>
                                    <p className="text-xs font-bold text-slate-400">Manage how you want to be contacted.</p>
                                </div>
                            </div>

                            <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-white/50 px-6 py-2">
                                {[
                                    { id: 'push', title: t('push_notify'), desc: t('push_desc'), icon: Bell },
                                    { id: 'email', title: t('email_notify'), desc: t('email_desc'), icon: Mail },
                                    { id: 'sms', title: t('sms_notify'), desc: t('sms_desc'), icon: Phone },
                                    { id: 'offers', title: t('offers_notify'), desc: t('offers_desc'), icon: Sparkles },
                                ].map((item) => (
                                    <div key={item.id} className="py-6 first:pt-0 last:pb-0 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.title}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setNotifications({...notifications, [item.id]: !notifications[item.id as keyof typeof notifications]})}
                                            className={cn(
                                                "w-14 h-8 rounded-full relative transition-all duration-300 p-1",
                                                notifications[item.id as keyof typeof notifications] ? "bg-brand-500" : "bg-slate-100"
                                            )}
                                        >
                                            <motion.div 
                                                animate={{ x: notifications[item.id as keyof typeof notifications] ? 24 : 0 }}
                                                className="w-6 h-6 bg-white rounded-full shadow-sm" 
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="data-privacy"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-2xl mx-auto space-y-8"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <button onClick={() => setActiveTab(null)} className="p-3 bg-slate-100 rounded-2xl hover:bg-slate-200"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase">{t('data')}</h2>
                                    <p className="text-xs font-bold text-slate-400">{t('privacy_manage')}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-8 py-2">
                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 border border-slate-100 rounded-2xl">
                                        <div>
                                            <h4 className="font-black uppercase text-sm mb-1">{t('download_data')}</h4>
                                            <p className="text-[10px] font-bold text-slate-400">{t('download_desc')}</p>
                                        </div>
                                        <button className="p-4 bg-white rounded-2xl shadow-sm text-brand-600 hover:bg-brand-50 transition-colors"><Compass className="w-5 h-5" /></button>
                                    </div>

                                    <div className="pt-8 border-t border-slate-100">
                                        <h4 className="font-black uppercase text-red-500 text-sm mb-4">{t('danger_zone')}</h4>
                                        <p className="text-xs font-bold text-slate-400 mb-6">{t('delete_desc')}</p>
                                        <button className="px-8 py-4 border-2 border-red-100 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors">{t('delete_account')}</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Logout - Integrated at the Bottom */}
                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
                    <button 
                        onClick={() => setShowLogoutConfirm(true)}
                        className="flex items-center gap-2 px-8 py-4 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 rounded-2xl transition-all"
                    >
                        <History className="w-4 h-4" />
                        {t('logout')}
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[200]"
                            onClick={() => setShowLogoutConfirm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-[48px] z-[210] overflow-hidden shadow-2xl border border-slate-100"
                        >
                            <div className="p-10 text-center">
                                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                                    <LogOut className="w-8 h-8 text-red-600" />
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 bg-red-500/10 rounded-full blur-xl"
                                    />
                                </div>
                                <h3 className="text-2xl font-black text-slate-950 mb-3 tracking-tight">
                                    Ready to <span className="text-red-600">Leave?</span>
                                </h3>
                                <p className="text-slate-500 font-bold mb-10 leading-relaxed">
                                    Are you sure you want to logout? We'll miss you!
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleLogout}
                                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
                                    >
                                        Yes, Logout
                                    </button>
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        No, Stay
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}



