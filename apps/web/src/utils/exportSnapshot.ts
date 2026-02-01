import html2canvas from "html2canvas";

export async function exportSnapshot() {
    const canvas = document.querySelector(".react-flow") as HTMLElement;
    if (!canvas) return;

    const snapshot = await html2canvas(canvas, {
        backgroundColor: "#0a0a0a",
        scale: 2,
    });

    snapshot.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "workflow.png";
        a.click();
    });
}
