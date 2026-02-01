export const PDF_COLORS = {
    // Brand Colors (ANC Standard)
    FRENCH_BLUE: "#0A52EF", // Primary Brand Color
    
    // Decorative Colors (Graphics Only)
    SPLISH_SPLASH: "#03B8FF",
    MALIBU_BLUE: "#0385DD",
    BLUE_OPAL: "#002C73",

    // UI Neutrals
    TABLE_HEADER_BG: "#0A52EF", // French Blue for headers
    BORDER_GRAY: "#D1D5DB",     // Gray-300
    TEXT_DARK: "#000000",       // Black
    TEXT_LIGHT: "#000000",      // Body copy also black primarily, or dark gray
    BACKGROUND_GRAY: "#F5F5F5", // Light gray for alternating rows
    STUDIO_GREY: "#E2E8F0",     // Background for paper preview
    ACCENT_RED: "#C8102E",  // Brand Red (Legacy)
    ACCENT_YELLOW: "#FFCD00", // Brand Yellow (Legacy)
};

export const PDF_STYLES = {
    // Typography
    Heading1: "text-2xl font-bold text-[#0A52EF]",
    Heading2: "text-lg font-bold text-[#0A52EF]",
    Body: "text-[12px] font-normal text-black",

    // Table Styles
    Table: "w-full text-[11px] border-collapse",
    TableHeaderCell: `bg-[#0A52EF] p-2 font-bold text-left text-white border-b border-[#D1D5DB]`,
    TableCell: "p-2 border-b border-[#D1D5DB] text-black",

    // Layout
    PageBreak: "break-before-page",
    AvoidBreak: "break-inside-avoid",
};
