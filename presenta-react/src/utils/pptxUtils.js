import PptxGenJS from 'pptxgenjs';

/**
 * Convert SlideWinder presentation to PowerPoint (.pptx)
 * @param {Object} presentation - SlideWinder presentation object
 * @returns {Promise<void>} - Initiates download of .pptx file
 */
export async function exportToPowerPoint(presentation) {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = 'SlideWinder';
  pptx.title = presentation.title || 'Presentation';
  pptx.subject = 'Created with SlideWinder';

  // Set slide dimensions (16:9 aspect ratio, standard PowerPoint size)
  pptx.layout = 'LAYOUT_16x9';

  // Process each slide
  for (const slide of presentation.slides) {
    // Skip nested slides for now (PowerPoint doesn't have nested structure)
    if (slide.parentId) continue;

    const pptxSlide = pptx.addSlide();

    // Apply slide background
    if (slide.background) {
      applySlideBackground(pptxSlide, slide.background);
    }

    // Add elements to slide
    for (const element of slide.elements) {
      try {
        await addElementToSlide(pptxSlide, element);
      } catch (error) {
        console.warn(`Failed to add element ${element.id}:`, error);
      }
    }
  }

  // Download the file
  const fileName = `${presentation.title || 'presentation'}.pptx`;
  await pptx.writeFile({ fileName });
}

/**
 * Apply background to PowerPoint slide
 */
function applySlideBackground(slide, background) {
  if (!background) return;

  if (background.type === 'color') {
    slide.background = { color: background.value.replace('#', '') };
  } else if (background.type === 'image') {
    slide.background = { path: background.value };
  }
  // Gradient and video backgrounds are not fully supported by pptxgenjs
}

/**
 * Add a SlideWinder element to PowerPoint slide
 */
async function addElementToSlide(slide, element) {
  // Convert SlideWinder coordinates (960x540) to PowerPoint inches
  // PowerPoint 16:9 is 10" x 5.625"
  const x = (element.x / 960) * 10;
  const y = (element.y / 540) * 5.625;
  const w = (element.width / 960) * 10;
  const h = (element.height / 540) * 5.625;

  switch (element.type) {
    case 'text':
      addTextElement(slide, element, x, y, w, h);
      break;
    case 'shape':
      addShapeElement(slide, element, x, y, w, h);
      break;
    case 'image':
      await addImageElement(slide, element, x, y, w, h);
      break;
    case 'table':
      addTableElement(slide, element, x, y, w, h);
      break;
    case 'chart':
      addChartElement(slide, element, x, y, w, h);
      break;
    // htmlContent and iframe are not directly supported in PowerPoint
    default:
      console.warn(`Element type ${element.type} not supported in PowerPoint export`);
  }
}

/**
 * Add text element to PowerPoint slide
 */
function addTextElement(slide, element, x, y, w, h) {
  // Strip HTML tags and convert to plain text for basic support
  // TODO: Parse HTML to preserve formatting
  const plainText = stripHtml(element.content);

  const textOptions = {
    x,
    y,
    w,
    h,
    fontSize: element.fontSize || 18,
    color: element.color?.replace('#', '') || '000000',
    align: element.computedStyles?.textAlign || 'left',
    valign: 'top',
    fontFace: element.computedStyles?.fontFamily || 'Arial',
    bold: element.computedStyles?.fontWeight === 'bold' || element.computedStyles?.fontWeight >= 600,
    italic: element.computedStyles?.fontStyle === 'italic'
  };

  // Handle rotation
  if (element.rotation) {
    textOptions.rotate = element.rotation;
  }

  slide.addText(plainText, textOptions);
}

/**
 * Add shape element to PowerPoint slide
 */
function addShapeElement(slide, element, x, y, w, h) {
  // Map SlideWinder shapes to PowerPoint shapes
  const shapeTypeMap = {
    'rectangle': 'rect',
    'circle': 'ellipse',
    'ellipse': 'ellipse',
    'triangle': 'triangle',
    'diamond': 'diamond',
    'arrow': 'rightArrow',
    'star': 'star5',
    'pentagon': 'pentagon',
    'hexagon': 'hexagon'
  };

  const pptxShapeType = shapeTypeMap[element.shapeType] || 'rect';

  const shapeOptions = {
    x,
    y,
    w,
    h,
    fill: { color: element.backgroundColor?.replace('#', '') || 'FFFFFF' },
    line: {
      color: element.borderColor?.replace('#', '') || '000000',
      width: element.borderWidth || 0,
      dashType: element.borderStyle === 'dashed' ? 'dash' : 'solid'
    }
  };

  // Handle rounded corners for rectangles
  if (element.shapeType === 'rectangle' && element.rounded) {
    shapeOptions.rectRadius = element.rounded / 10; // Approximate conversion
  }

  // Handle rotation
  if (element.rotation) {
    shapeOptions.rotate = element.rotation;
  }

  slide.addShape(pptxShapeType, shapeOptions);
}

/**
 * Add image element to PowerPoint slide
 */
async function addImageElement(slide, element, x, y, w, h) {
  const imageOptions = {
    x,
    y,
    w,
    h,
    sizing: {
      type: 'cover',
      w,
      h
    }
  };

  // Handle rotation
  if (element.rotation) {
    imageOptions.rotate = element.rotation;
  }

  // Use imageData (base64) if available, otherwise use src URL
  if (element.imageData) {
    imageOptions.data = element.imageData;
  } else if (element.src) {
    imageOptions.path = element.src;
  }

  slide.addImage(imageOptions);
}

/**
 * Add table element to PowerPoint slide
 */
function addTableElement(slide, element, x, y, w, h) {
  if (!element.cellData || !element.cellData.length) return;

  // Convert cell data to PowerPoint table format
  const tableRows = element.cellData.map((row, rowIdx) => {
    return row.map((cellContent, colIdx) => {
      const cellStyle = element.cellStyles?.[rowIdx]?.[colIdx] || {};

      return {
        text: cellContent || '',
        options: {
          fill: cellStyle.backgroundColor?.replace('#', '') || 'FFFFFF',
          color: cellStyle.color?.replace('#', '') || '000000',
          align: cellStyle.textAlign || 'left',
          valign: cellStyle.verticalAlign || 'middle',
          fontSize: cellStyle.fontSize || 12,
          bold: cellStyle.fontWeight === 'bold' || cellStyle.fontWeight >= 600,
          border: {
            pt: cellStyle.borderWidth || 1,
            color: cellStyle.borderColor?.replace('#', '') || '000000'
          }
        }
      };
    });
  });

  slide.addTable(tableRows, {
    x,
    y,
    w,
    h,
    colW: w / element.cellData[0].length, // Equal column widths
    rowH: h / element.cellData.length // Equal row heights
  });
}

/**
 * Add chart element to PowerPoint slide
 */
function addChartElement(slide, element, x, y, w, h) {
  if (!element.chartData || !element.chartType) return;

  // Map chart types
  const chartTypeMap = {
    'bar': 'bar',
    'line': 'line',
    'pie': 'pie',
    'doughnut': 'doughnut',
    'radar': 'radar',
    'scatter': 'scatter'
  };

  const pptxChartType = chartTypeMap[element.chartType] || 'bar';

  // Convert Chart.js data format to PowerPoint format
  const chartData = [];

  if (element.chartData.labels && element.chartData.datasets) {
    element.chartData.datasets.forEach(dataset => {
      chartData.push({
        name: dataset.label || 'Series',
        labels: element.chartData.labels,
        values: dataset.data || []
      });
    });
  }

  slide.addChart(pptxChartType, chartData, {
    x,
    y,
    w,
    h,
    showTitle: element.chartOptions?.plugins?.title?.display || false,
    title: element.chartOptions?.plugins?.title?.text || '',
    showLegend: element.chartOptions?.plugins?.legend?.display !== false,
    showValue: element.chartOptions?.plugins?.datalabels?.display || false
  });
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Import PowerPoint (.pptx) file to SlideWinder format
 * Note: This is a placeholder - full PPTX parsing is complex and requires additional libraries
 */
export async function importFromPowerPoint(file) {
  throw new Error('PowerPoint import is not yet implemented. Use Reveal.js HTML import instead.');

  // TODO: Implement PPTX parsing
  // Will require parsing OOXML structure:
  // 1. Unzip .pptx file
  // 2. Parse XML files (presentation.xml, slide*.xml)
  // 3. Extract shapes, text, images
  // 4. Convert to SlideWinder format
  // Libraries: jszip, xml-js or fast-xml-parser
}
