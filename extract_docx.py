import zipfile
import xml.etree.ElementTree as ET

def get_docx_text(path):
    """
    Take the path of a docx file as argument, return the text in unicode.
    """
    document = zipfile.ZipFile(path)
    xml_content = document.read('word/document.xml')
    document.close()
    tree = ET.fromstring(xml_content)

    # Word XML namespaces
    namespaces = {
        'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
    }

    paragraphs = []
    for paragraph in tree.findall('.//w:p', namespaces):
        texts = [node.text for node in paragraph.findall('.//w:t', namespaces) if node.text]
        if texts:
            paragraphs.append("".join(texts))

    return "\n".join(paragraphs)

if __name__ == "__main__":
    try:
        text = get_docx_text(r"c:\Users\MMohammad\Desktop\Chain-Cred-final\Blockchain Report Format.docx")
        print("--- START OF TEXT ---")
        print(text)
        print("--- END OF TEXT ---")
    except Exception as e:
        print(f"Error: {e}")
