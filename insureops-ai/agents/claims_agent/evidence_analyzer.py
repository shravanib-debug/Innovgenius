"""
AI Evidence Analyzer Module
Uses GPT-4o-mini Vision to analyze claim evidence (images/PDFs) and extract structured data.
Falls back to pytesseract OCR if Vision API is unavailable.
"""

import os
import base64
import json
import io
from typing import List, Dict, Any, Optional
from PIL import Image
import fitz  # PyMuPDF
import pytesseract
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

# Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

class EvidenceAnalyzer:
    def __init__(self):
        self.client = None
        if OPENROUTER_API_KEY:
            self.client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=OPENROUTER_API_KEY
            )

    def analyze_evidence(self, file_path: str, claim_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Main entry point. Analyzes a file (image or PDF) and returns structured data.
        """
        print(f"   🔍 Analyzing evidence: {os.path.basename(file_path)}...")
        
        try:
            # 1. Detect file type and prepare images
            images = self._prepare_images(file_path)
            if not images:
                return {"error": "Could not process file or empty file"}

            # 2. Try Vision API first
            if self.client:
                try:
                    return self._analyze_with_vision(images, os.path.basename(file_path), claim_context)
                except Exception as e:
                    print(f"   ⚠️ Vision API failed: {e}. Falling back to OCR.")
            
            # 3. Fallback to Local OCR
            return self._analyze_with_ocr(images)

        except Exception as e:
            print(f"   ❌ Evidence analysis error: {e}")
            return {"error": str(e)}

    def _prepare_images(self, file_path: str) -> List[Image.Image]:
        """Convert input file (Image or PDF) to PIL Images."""
        ext = os.path.splitext(file_path)[1].lower()
        images = []

        if ext == '.pdf':
            try:
                doc = fitz.open(file_path)
                for page in doc:
                    pix = page.get_pixmap()
                    img_data = pix.tobytes("png")
                    images.append(Image.open(io.BytesIO(img_data)))
            except Exception as e:
                print(f"   ❌ PDF conversion failed: {e}")
        elif ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
            try:
                images.append(Image.open(file_path))
            except Exception as e:
                print(f"   ❌ Image open failed: {e}")
        
        return images

    def _encode_image(self, image: Image.Image) -> str:
        """Convert PIL Image to base64 string."""
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')

    def _analyze_with_vision(self, images: List[Image.Image], filename: str, context: Dict) -> Dict[str, Any]:
        """Send images to GPT-4o-Vision for analysis."""
        
        # Prepare context description
        context_str = json.dumps(context, indent=2) if context else "No context provided"
        
        # Limit to first 3 pages/images to avoid token limits/cost
        images_to_process = images[:3]
        
        messages = [
            {
                "role": "system", 
                "content": "You are an expert insurance claims evidence analyst. Extract key information from the provided document/image. Return ONLY JSON."
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text", 
                        "text": f"Analyze this evidence file ('{filename}') for an insurance claim.\n\nClaim Context:\n{context_str}\n\nExtract:\n1. Document Type (e.g., Bill, Police Report, Photo)\n2. Key Fields (Dates, Amounts, Names, ID numbers)\n3. Validation Flags (e.g., date matches claim date, consistency check)\n4. Damage Severity (0.0-1.0) if applicable (for photos)\n5. Fraud Indicators (suspicious edits, reused photos)\n\nReturn JSON only."
                    }
                ]
            }
        ]

        # Add images to prompt
        for img in images_to_process:
            base64_image = self._encode_image(img)
            messages[1]["content"].append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/png;base64,{base64_image}"
                }
            })

        response = self.client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=messages,
            max_tokens=1000
        )

        content = response.choices[0].message.content
        return self._parse_json(content)

    def _analyze_with_ocr(self, images: List[Image.Image]) -> Dict[str, Any]:
        """Fallback: Use Tesseract to get text, then regex/heuristic parsing (simulated here for simplicity unless we add another LLM call)."""
        full_text = ""
        try:
            for img in images:
                full_text += pytesseract.image_to_string(img) + "\n"
        except Exception as e:
            return {"error": f"OCR failed (Tesseract not installed?): {e}", "extracted_text": ""}

        # Simple heuristic extraction since we can't use LLM in fallback without API key
        # In a real system, we might use a local LLM or lighter model here.
        # For now, return raw text.
        return {
            "method": "local_ocr",
            "document_type": "Unknown (OCR)",
            "extracted_text": full_text.strip(),
            "flags": ["Analyzed via fallback OCR - structured data unavailable"]
        }

    def _parse_json(self, content: str) -> Dict[str, Any]:
        """Extract JSON from LLM response."""
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            return json.loads(content.strip())
        except:
            return {"raw_content": content, "error": "Failed to parse JSON"}

# Usage Example
if __name__ == "__main__":
    analyzer = EvidenceAnalyzer()
    # Mock context
    print("Test run (no file provided)...")
