from docx import Document

path = r"d:\Users\remin\PetConectaB\docs\Atividades Extensionistas - Modelo de Proposta de tema e Trabalho Final - PREENCHIDO.docx"
out = r"d:\Users\remin\PetConectaB\docs\Atividades Extensionistas - Modelo de Proposta de tema e Trabalho Final - PREENCHIDO FINAL.docx"

repo_link = "https://github.com/Reminson-uninter/petfinder"
video_text = "[INSERIR_LINK_DO_VIDEO_AQUI - vídeo ainda não publicado]"


def replace_in_paragraph(paragraph, old, new):
    if old in paragraph.text:
        for run in paragraph.runs:
            if old in run.text:
                run.text = run.text.replace(old, new)
        if old in paragraph.text:
            paragraph.text = paragraph.text.replace(old, new)


doc = Document(path)
for p in doc.paragraphs:
    replace_in_paragraph(p, "[INSERIR_LINK_DO_GITHUB_AQUI]", repo_link)
    replace_in_paragraph(p, "[INSERIR_LINK_DO_VIDEO_AQUI]", video_text)

doc.save(out)
print(out)
