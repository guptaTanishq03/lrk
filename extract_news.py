import fitz
import os

pdf_path = r"C:\Users\acer\.gemini\antigravity-ide\brain\012e15ee-508c-43b4-a2e4-62698c512dff\media__1782659496262.pdf"
output_dir = r"C:\Users\acer\Desktop\LRK\images\news"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

try:
    doc = fitz.open(pdf_path)
    print(f"Opened PDF with {len(doc)} pages.")
    
    # We will just extract all pages as images for now or specific ones if we knew. 
    # Let's extract all of them as low-res first to see what they are, or just a few.
    # Actually, let's extract all of them with a decent resolution, maybe 150 DPI.
    
    for page_num in range(min(10, len(doc))): # extract first 10 for now to avoid overload
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=150)
        output_file = os.path.join(output_dir, f"news_page_{page_num + 1}.png")
        pix.save(output_file)
        print(f"Saved {output_file}")
        
except Exception as e:
    print(f"Error: {e}")
