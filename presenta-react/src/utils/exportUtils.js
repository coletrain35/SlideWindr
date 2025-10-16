import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export a single slide as an image
 * @param {HTMLElement} slideElement - The slide DOM element to export
 * @param {string} filename - The filename for the exported image
 * @param {object} options - Export options (quality, format)
 */
export const exportSlideAsImage = async (slideElement, filename = 'slide', options = {}) => {
    const {
        quality = 1.0, // 0.1 to 1.0
        format = 'png', // 'png' or 'jpeg'
        scale = 2 // Higher scale = better quality but larger file
    } = options;

    try {
        const canvas = await html2canvas(slideElement, {
            scale: scale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: null,
            logging: false
        });

        // Convert canvas to blob
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to create image blob'));
                        return;
                    }

                    // Create download link
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${filename}.${format}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    resolve(blob);
                },
                `image/${format}`,
                quality
            );
        });
    } catch (error) {
        console.error('Error exporting slide as image:', error);
        throw error;
    }
};

/**
 * Export all slides as individual images
 * @param {HTMLElement[]} slideElements - Array of slide DOM elements
 * @param {string} baseFilename - Base filename for exported images
 * @param {object} options - Export options
 */
export const exportAllSlidesAsImages = async (slideElements, baseFilename = 'slide', options = {}) => {
    const promises = slideElements.map((slideElement, index) => {
        const filename = `${baseFilename}_${index + 1}`;
        return exportSlideAsImage(slideElement, filename, options);
    });

    try {
        await Promise.all(promises);
        return { success: true, count: slideElements.length };
    } catch (error) {
        console.error('Error exporting slides as images:', error);
        throw error;
    }
};

/**
 * Export slides as PDF
 * @param {HTMLElement[]} slideElements - Array of slide DOM elements
 * @param {string} filename - The filename for the PDF
 * @param {object} options - Export options
 */
export const exportSlidesAsPDF = async (slideElements, filename = 'presentation', options = {}) => {
    const {
        orientation = 'landscape', // 'landscape' or 'portrait'
        quality = 1.0,
        scale = 2
    } = options;

    try {
        // Create PDF with appropriate dimensions
        // Standard presentation size: 960x700px
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'px',
            format: orientation === 'landscape' ? [960, 700] : [700, 960]
        });

        for (let i = 0; i < slideElements.length; i++) {
            const slideElement = slideElements[i];

            // Capture slide as canvas
            const canvas = await html2canvas(slideElement, {
                scale: scale,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            // Convert canvas to image
            const imgData = canvas.toDataURL('image/jpeg', quality);

            // Add page (except for first slide)
            if (i > 0) {
                pdf.addPage();
            }

            // Add image to PDF
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

            // Show progress (optional callback could be added)
            console.log(`Processing slide ${i + 1}/${slideElements.length}`);
        }

        // Save PDF
        pdf.save(`${filename}.pdf`);

        return { success: true, count: slideElements.length };
    } catch (error) {
        console.error('Error exporting slides as PDF:', error);
        throw error;
    }
};

/**
 * Export presentation data as JSON
 * @param {object} presentationData - The presentation data object
 * @param {string} filename - The filename for the JSON export
 */
export const exportAsJSON = (presentationData, filename = 'presentation') => {
    try {
        const json = JSON.stringify(presentationData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error('Error exporting as JSON:', error);
        throw error;
    }
};

/**
 * Import presentation data from JSON file
 * @param {File} file - The JSON file to import
 * @returns {Promise<object>} - The parsed presentation data
 */
export const importFromJSON = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error('No file provided'));
            return;
        }

        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            reject(new Error('Invalid file type. Please select a JSON file.'));
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                // Basic validation
                if (!data.slides || !Array.isArray(data.slides)) {
                    reject(new Error('Invalid presentation data: missing or invalid slides array'));
                    return;
                }

                if (!data.title || typeof data.title !== 'string') {
                    reject(new Error('Invalid presentation data: missing or invalid title'));
                    return;
                }

                resolve(data);
            } catch (error) {
                reject(new Error(`Failed to parse JSON: ${error.message}`));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
};
