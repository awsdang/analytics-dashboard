import { mockAPI } from "@/service/api"
import { Transaction, Merchant } from "@/types/transactions"


export async function exportData(
    timeRange: "day" | "week" | "month" | "year" = "week", 
    filename: string, 
    format: "csv" | "json", 
    filter: any = {},
    sort?: { field: keyof Transaction; direction: "asc" | "desc" }) {

    try {
        // Get the CSV or JSON content
        const content = await mockAPI.exportData(timeRange, format, filter, sort)

        // Create and download the file
        const mimeType = format === "csv" ? "text/csv" : "application/json"
        const extension = format

        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")

        link.href = url
        link.download = `${filename}.${extension}`
        document.body.appendChild(link)
        link.click()

        // Clean up
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    } catch (error) {
        console.error("Error exporting data:", error)
        alert("Failed to export data. Please try again.")
    }
}

export async function exportMerchants(
    timeRange: "day" | "week" | "month" | "year" = "week", 
    filename: string,
    format: "csv" | "json",
    filter: any = {},
    sort?: { field: keyof Merchant; direction: "asc" | "desc" }
) {
    try {
        const content = await mockAPI.exportMerchants(timeRange,format, filter, sort);
        const mimeType = format === "csv" ? "text/csv" : "application/json";
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `${filename}.${format}`;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error exporting merchants:", error);
        alert("Failed to export merchants. Please try again.");
    }
}

