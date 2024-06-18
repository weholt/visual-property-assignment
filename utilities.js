function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateFieldName(element) {
    let path = [];
    let current = element;
    while (current && current !== document.documentElement) {
        let tagName = current.tagName.toLowerCase();
        if (current.id) {
            tagName += `#${current.id}`;
        }
        path.unshift(tagName);
        current = current.parentElement;
    }
    return path.join(' > ');
}

function addDataUuids(element) {
    if (element.nodeType === Node.ELEMENT_NODE) {
        if (!element.hasAttribute('data-uuid')) {
            element.setAttribute('data-uuid', generateUuid());
        }
        element.childNodes.forEach(addDataUuids);
    }
}

function makeImagePathsAbsolute(element, baseUrl) {
    const images = element.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http')) {
            const absoluteUrl = new URL(src, baseUrl).href;
            img.setAttribute('src', absoluteUrl);
        }
    });
}

function convertMetaTags(doc) {
    const metaTags = doc.querySelectorAll('meta');
    metaTags.forEach(meta => {
        let name = meta.getAttribute('name') || meta.getAttribute('property');
        if (name !== null && name !== undefined) {
            name = name.replaceAll(':', '_');
            name = name.replaceAll("-", "_");
            name = `meta_${name}`;
            meta.setAttribute('t-field', `page.${name}`);
        }
    });
}
