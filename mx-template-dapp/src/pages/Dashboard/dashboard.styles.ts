// prettier-ignore
export default {
  dashboardContainer: 'dashboard-container flex flex-col lg:flex-row w-full min-h-screen relative transition-all duration-200',
  mobilePanelContainer: 'mobile-panel-container fixed bottom-0 left-0 right-0 z-50 max-h-full overflow-y-auto lg:static lg:max-h-none lg:overflow-visible',
  desktopPanelContainer: 'desktop-panel-container lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:overflow-y-auto bg-slate-950/20 border-r border-white/5 w-80 shrink-0',
  dashboardContent: 'dashboard-content flex flex-col gap-6 flex-1 w-full p-4 lg:p-10 transition-all duration-200 ease-out',
  dashboardContentMobilePanelOpen: 'dashboard-content-mobile-panel-open opacity-20 lg:opacity-100 pointer-events-none',
  dashboardWidgets: 'dashboard-widgets flex flex-col gap-6 w-full'
} satisfies Record<string, string>;
