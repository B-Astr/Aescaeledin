import { useEffect } from "react";

const DEFAULT_DESCRIPTION =
  "ASCALEdin conecta empleos, empresas y servicios profesionales en una plataforma segura.";

export function usePageMeta(title: string, description = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    document.title = title;

    let descriptionTag = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );

    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.name = "description";
      document.head.appendChild(descriptionTag);
    }

    descriptionTag.content = description;
  }, [description, title]);
}
