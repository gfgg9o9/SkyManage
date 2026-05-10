import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "dashboard": "Dashboard",
        "projects": "Projects",
        "mission_control": "Mission Control",
        "neural_network": "Neural Map",
        "live_terminal": "Action Log",
        "parameters": "Parameters",
        "kill_session": "Kill Session"
      },
      "settings": {
        "title": "Parameters",
        "subtitle": "Manage your workspace identity & preferences",
        "save": "Save Changes",
        "export": "Export Data",
        "saving": "Syncing...",
        "profile": "Global Profile",
        "preferences": "Platform Preferences",
        "security": "Security & Access",
        "regional": "Regional Settings",
        "language": "Language",
        "timezone": "Timezone",
        "theme": "Visual Theme",
        "accent": "Primary Accent",
        "password": "Password",
        "mfa": "Two-Factor Auth",
        "logs": "System Logs"
      },
      "dashboard": {
        "welcome": "Interface Protocol",
        "status": "Operational",
        "active_clusters": "Active Clusters",
        "open_tickets": "Open Tickets",
        "network_load": "Network Load",
        "total_tasks": "Total Tasks",
        "in_progress": "In Progress",
        "completed": "Completed",
        "urgent": "Urgent",
        "task_status": "Task Status",
        "priority_dist": "Priority Distribution",
        "recent_activity": "Recent Activity",
        "audit_log": "Audit Log",
        "realtime": "Real-time",
        "analytics": "Analytics",
        "live": "Live",
        "deadline": "Deadline",
        "no_results": "No results found for your query.",
        "empty": "Cloud is currently empty. Initialize your first project task."
      },
      "status": {
        "todo": "To Do",
        "in_progress": "In Progress",
        "review": "Review",
        "done": "Done"
      },
      "kanban": {
        "delete_task": "Delete",
        "deleting": "Deleting task...",
        "deleted": "Task successfully deleted.",
        "failed_delete": "Failed to delete task.",
        "add_task": "New Task"
      },
      "projects": {
        "title": "Active Projects",
        "subtitle": "Manage and organize all your workspace clusters.",
        "new": "Launch New Project",
        "stats_members": "Members",
        "access": "Access Environment",
        "purge": "Purge Cluster",
        "no_projects": "No project clusters found",
        "initialize": "Initialize first cloud environment",
        "modal_title": "New Environment",
        "label_name": "Cluster Name",
        "label_specs": "Specifications",
        "placeholder_name": "e.g. Infrastructure V2",
        "placeholder_specs": "Project goals and technical details...",
        "btn_cancel": "Terminate",
        "btn_launch": "Launch Project",
        "toast_success": "Project environment launched successfully.",
        "toast_fail": "Failed to launch project.",
        "toast_purging": "Purging cluster...",
        "toast_purged": "Project cluster successfully purged."
      },
      "task": {
        "priority_suffix": "Priority",
        "purge_title": "Purge Task",
        "purging": "Purging task...",
        "purged": "Task successfully purged.",
        "failed_purge": "Failed to purge task.",
        "description": "Description",
        "no_telemetry": "No telemetry provided for this task.",
        "reporter": "Reporter",
        "agent": "Agent",
        "initialization": "Initialization",
        "comms_logs": "Comms Logs",
        "no_comms": "No communications recorded",
        "ago": "ago",
        "broadcast": "Broadcast message...",
        "secured": "Satellite Link Secured"
      }
    }
  },
  fr: {
    translation: {
      "nav": {
        "dashboard": "Tableau de Bord",
        "projects": "Projets",
        "mission_control": "Contrôle Mission",
        "neural_network": "Carte Neurale",
        "live_terminal": "Journal d'Action",
        "parameters": "Paramètres",
        "kill_session": "Déconnexion"
      },
      "settings": {
        "title": "Paramètres",
        "subtitle": "Gérez votre identité et vos préférences de travail",
        "save": "Enregistrer",
        "export": "Exporter",
        "saving": "Synchronisation...",
        "profile": "Profil Global",
        "preferences": "Préférences Plateforme",
        "security": "Sécurité & Accès",
        "regional": "Paramètres Régionaux",
        "language": "Langue",
        "timezone": "Fuseau Horaire",
        "theme": "Thème Visuel",
        "accent": "Accent Principal",
        "password": "Mot de Passe",
        "mfa": "Auth Double Facteur",
        "logs": "Journaux Système"
      },
      "dashboard": {
        "welcome": "Protocole d'Interface",
        "status": "Opérationnel",
        "active_clusters": "Clusters Actifs",
        "open_tickets": "Tickets Ouverts",
        "network_load": "Charge Réseau",
        "total_tasks": "Total Tâches",
        "in_progress": "En Cours",
        "completed": "Terminées",
        "urgent": "Urgent",
        "task_status": "Statut des Tâches",
        "priority_dist": "Distribution des Priorités",
        "recent_activity": "Activité Récente",
        "audit_log": "Journal d'Audit",
        "realtime": "Temps réel",
        "analytics": "Analytique",
        "live": "En direct",
        "deadline": "Échéance",
        "no_results": "Aucun résultat trouvé pour votre requête.",
        "empty": "Le cloud est vide. Initialisez votre première tâche de projet."
      },
      "status": {
        "todo": "À Faire",
        "in_progress": "En Cours",
        "review": "Révision",
        "done": "Terminé"
      },
      "priority": {
        "low": "Faible",
        "medium": "Moyenne",
        "high": "Haute",
        "urgent": "Urgent"
      },
      "projects": {
        "title": "Projets Actifs",
        "subtitle": "Gérez et organisez tous vos clusters de travail.",
        "new": "Lancer Nouveau Projet",
        "stats_members": "Membres",
        "access": "Accéder à l'Espace",
        "purge": "Purger le Cluster",
        "no_projects": "Aucun cluster de projet trouvé",
        "initialize": "Initialiser le premier environnement cloud",
        "modal_title": "Nouvel Environnement",
        "label_name": "Nom du Cluster",
        "label_specs": "Spécifications",
        "placeholder_name": "ex. Infrastructure V2",
        "placeholder_specs": "Objectifs du projet et détails techniques...",
        "btn_cancel": "Abandonner",
        "btn_launch": "Lancer Projet",
        "toast_success": "Environnement de projet lancé avec succès.",
        "toast_fail": "Échec du lancement du projet.",
        "toast_purging": "Purge du cluster...",
        "toast_purged": "Cluster de projet purgé avec succès."
      },
      "kanban": {
        "delete_task": "Supprimer",
        "deleting": "Suppression de la tâche...",
        "deleted": "Tâche supprimée avec succès.",
        "failed_delete": "Échec de la suppression de la tâche.",
        "add_task": "Nouvelle Tâche"
      },
      "task": {
        "priority_suffix": "Priorité",
        "purge_title": "Purger la Tâche",
        "purging": "Purge de la tâche...",
        "purged": "Tâche purgée avec succès.",
        "failed_purge": "Échec de la purge de la tâche.",
        "description": "Description",
        "no_telemetry": "Aucune télémétrie fournie pour cette tâche.",
        "reporter": "Rapporteur",
        "agent": "Agent",
        "initialization": "Initialisation",
        "comms_logs": "Logs de Comm",
        "no_comms": "Aucune communication enregistrée",
        "ago": "",
        "broadcast": "Diffuser un message...",
        "secured": "Lien Satellite Sécurisé"
      }
    }
  },
  ar: {
    translation: {
      "nav": {
        "dashboard": "لوحة القيادة",
        "projects": "المشاريع",
        "mission_control": "غرفة التحكم",
        "neural_network": "الخريطة العصبية",
        "live_terminal": "سجل العمليات",
        "parameters": "الإعدادات",
        "kill_session": "إنهاء الجلسة"
      },
      "settings": {
        "title": "الإعدادات",
        "subtitle": "إدارة هويتك وتفضيلات مساحة العمل الخاصة بك",
        "save": "حفظ التغييرات",
        "export": "تصدير البيانات",
        "saving": "جاري المزامنة...",
        "profile": "الملف الشخصي العالمي",
        "preferences": "تفضيلات المنصة",
        "security": "الأمن والوصول",
        "regional": "الإعدادات الإقليمية",
        "language": "اللفة",
        "timezone": "المنطقة الزمنية",
        "theme": "المظهر البصري",
        "accent": "اللون الأساسي",
        "password": "كلمة المرور",
        "mfa": "المصادقة الثنائية",
        "logs": "سجلات النظام"
      },
      "dashboard": {
        "welcome": "بروتوكول الواجهة",
        "status": "قيد التشغيل",
        "active_clusters": "المجموعات النشطة",
        "open_tickets": "التذاكر المفتوحة",
        "network_load": "حمل الشبكة",
        "total_tasks": "إجمالي المهام",
        "in_progress": "قيد التنفيذ",
        "completed": "مكتملة",
        "urgent": "هام جداً",
        "task_status": "حالة المهمة",
        "priority_dist": "توزيع الأولويات",
        "recent_activity": "النشاط الأخير",
        "audit_log": "سجل التدقيق",
        "realtime": "وقت حقيقي",
        "analytics": "تحليلات",
        "live": "مباشر",
        "deadline": "الموعد النهائي",
        "no_results": "لم يتم العثور على نتائج لاستعلامك.",
        "empty": "السحابة فارغة حالياً. ابدأ أول مهمة لمشروعك."
      },
      "status": {
        "todo": "للقيام به",
        "in_progress": "قيد التنفيذ",
        "review": "مراجعة",
        "done": "مكتمل"
      },
      "priority": {
        "low": "منخفض",
        "medium": "متوسط",
        "high": "عالي",
        "urgent": "عاجل"
      },
      "projects": {
        "title": "المشاريع النشطة",
        "subtitle": "إدارة وتنظيم كافة مجموعات مساحة العمل الخاصة بك.",
        "new": "إطلاق مشروع جديد",
        "stats_members": "أعضاء",
        "access": "الدخول إلى البيئة",
        "purge": "تطهير المجموعة",
        "no_projects": "لم يتم العثور على مجموعات مشاريع",
        "initialize": "تهيئة أول بيئة سحابية",
        "modal_title": "بيئة جديدة",
        "label_name": "اسم المجموعة",
        "label_specs": "المواصفات",
        "placeholder_name": "مثلاً: البنية التحتية V2",
        "placeholder_specs": "أهداف المشروع والتفاصيل التقنية...",
        "btn_cancel": "إنهاء",
        "btn_launch": "إطلاق المشروع",
        "toast_success": "تم إطلاق بيئة المشروع بنجاح.",
        "toast_fail": "فشل إطلاق المشروع.",
        "toast_purging": "جاري تطهير المجموعة...",
        "toast_purged": "تم تطهير مجموعة المشروع بنجاح."
      },
      "kanban": {
        "delete_task": "حذف",
        "deleting": "جاري حذف المهمة...",
        "deleted": "تم حذف المهمة بنجاح.",
        "failed_delete": "فشل حذف المهمة.",
        "add_task": "مهمة جديدة"
      },
      "task": {
        "priority_suffix": "أولوية",
        "purge_title": "تطهير المهمة",
        "purging": "جاري تطهير المهمة...",
        "purged": "تم تطهير المهمة بنجاح.",
        "failed_purge": "فشل تطهير المهمة.",
        "description": "الوصف",
        "no_telemetry": "لا يوجد بيانات لهذه المهمة.",
        "reporter": "المبلغ",
        "agent": "العميل",
        "initialization": "التهيئة",
        "comms_logs": "سجلات التواصل",
        "no_comms": "لا يوجد اتصالات مسجلة",
        "ago": "قبل",
        "broadcast": "بث رسالة...",
        "secured": "اتصال القمر الصناعي مؤمن"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;
