
document.addEventListener('DOMContentLoaded', () => {
    let contentJson = {
        "text": {},
        "images": {},
        "links": {},
        "meta": {}
    };

    const iframe = document.getElementById('iframe');
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    const dynamicForm = document.getElementById('dynamicForm');
    const metaForm = document.getElementById('metaForm');
    const tabMeta = document.getElementById('tab-meta');
    const tabImages = document.getElementById('tab-images');
    const dynamicInputs = document.getElementById('dynamicInputs');
    const selectionCount = document.getElementById('selectionCount');
    const parentDropdown = document.getElementById('parentDropdown');
    const fileInput = document.getElementById('fileInput');
    let selectedElements = [];
    let selectedElement = null;

    function createInput(labelText, value, uuid, placeholder, attribute) {
        const div = document.createElement('div');
        div.classList.add('mb-3');
        const label = document.createElement('label');
        label.textContent = labelText;
        label.classList.add('form-label');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value || '';
        input.dataset.uuid = uuid;
        input.dataset.attribute = attribute;
        input.placeholder = placeholder;
        input.classList.add('form-control');
        input.addEventListener('input', (e) => {
            const uuid = e.target.dataset.uuid;
            const attribute = e.target.dataset.attribute;
            const elements = iframeDoc.querySelectorAll(`[data-uuid="${uuid}"]`);
            elements.forEach(el => {
                if (attribute === 'innerText') {
                    el.innerText = e.target.value;
                } else {
                    el.setAttribute(attribute, e.target.value);
                }
                if (el.dataset.fieldName) {
                    el.setAttribute('t-field', e.target.value);
                }
            });
        });
        div.appendChild(label);
        div.appendChild(input);
        return div;
    }

    function createTextarea(labelText, value, uuid, placeholder, attribute) {
        const div = document.createElement('div');
        div.classList.add('mb-3');
        const label = document.createElement('label');
        label.textContent = labelText;
        label.classList.add('form-label');
        const textarea = document.createElement('textarea');
        textarea.rows = 1;
        textarea.value = value || '';
        textarea.dataset.uuid = uuid;
        textarea.dataset.attribute = attribute;
        textarea.placeholder = placeholder;
        textarea.classList.add('form-control');
        textarea.style.resize = 'none';
        textarea.addEventListener('input', (e) => {
            const uuid = e.target.dataset.uuid;
            const attribute = e.target.dataset.attribute;
            const elements = iframeDoc.querySelectorAll(`[data-uuid="${uuid}"]`);
            elements.forEach(el => {
                el.innerText = e.target.value;
            });
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
        });
        div.appendChild(label);
        div.appendChild(textarea);
        return div;
    }

    function createCheckbox(labelText, checked, uuid, attribute) {
        const div = document.createElement('div');
        div.classList.add('mb-3');
        const label = document.createElement('label');
        label.classList.add('form-check-label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = checked;
        checkbox.dataset.uuid = uuid;
        checkbox.dataset.attribute = attribute;
        checkbox.classList.add('form-check-input');
        checkbox.addEventListener('change', (e) => {
            const uuid = e.target.dataset.uuid;
            const attribute = e.target.dataset.attribute;
            const elements = iframeDoc.querySelectorAll(`[data-uuid="${uuid}"]`);
            elements.forEach(el => {
                if (e.target.checked) {
                    el.setAttribute(attribute, true);
                } else {
                    el.removeAttribute(attribute);
                }
            });
        });
        label.appendChild(checkbox);
        label.append(` ${labelText}`);
        div.appendChild(label);
        return div;
    }

    function createNumberInput(labelText, value, uuid, placeholder, attribute) {
        const div = document.createElement('div');
        div.classList.add('col');
        const label = document.createElement('label');
        label.textContent = labelText;
        label.classList.add('form-label');
        const input = document.createElement('input');
        input.type = 'number';
        input.value = value || '';
        input.dataset.uuid = uuid;
        input.dataset.attribute = attribute;
        input.placeholder = placeholder;
        input.classList.add('form-control');
        input.addEventListener('input', (e) => {
            const uuid = e.target.dataset.uuid;
            const attribute = e.target.dataset.attribute;
            const elements = iframeDoc.querySelectorAll(`[data-uuid="${uuid}"]`);
            elements.forEach(el => {
                if (e.target.value === '') {
                    el.removeAttribute(attribute);
                } else {
                    el.setAttribute(attribute, e.target.value);
                }
            });
        });
        div.appendChild(label);
        div.appendChild(input);
        return div;
    }

    function createFormForElement(uuid) {
        if (!dynamicForm) return;
        dynamicForm.innerHTML = ''; // Clear the dynamic form
        const element = iframeDoc.querySelector(`[data-uuid="${uuid}"]`);
        if (!element) return;
        const fieldName = generateFieldName(element);
        dynamicForm.appendChild(createInput("Field Name", element.getAttribute('t-field') || fieldName, uuid, "Field Name", "t-field"));

        const is_container_element = element.dataset.container !== undefined;
        if (!is_container_element) {
            dynamicForm.appendChild(createTextarea("Content", element.innerText, uuid, "Content", "innerText"));            
        }
        dynamicForm.appendChild(createInput("Class", element.className, uuid, "Class", "class"));
        dynamicForm.appendChild(createInput("Style", element.getAttribute('style'), uuid, "Style", "style"));
        addFieldTypeSelect(dynamicForm, is_container_element);
        const fieldTypeElement = document.getElementById('fieldType');
        if (fieldTypeElement) {
            fieldTypeElement.value = element.getAttribute('t-type') || 'string';
            generateDynamicInputs(uuid, element, is_container_element);
        }
    }

    function generateDynamicInputs(uuid, element, is_container_element) {
        if (!dynamicInputs) return;
        dynamicInputs.innerHTML = ''; // Clear dynamic inputs
        const fieldTypeElement = document.getElementById('fieldType');
        if (!fieldTypeElement) return;
        const fieldType = fieldTypeElement.value;
        const fieldsToShow = getFieldsForType(fieldType);
        if (is_container_element) {
            fieldsToShow.forEach(field => {
                switch (field) {
                    case 7:
                        dynamicInputs.appendChild(createInput("Description", element.getAttribute('t-description'), uuid, "Description", "t-description"));
                        break;
                    case 99:
                        const iterableGroup = document.createElement('div');
                        iterableGroup.classList.add('row');
                        iterableGroup.appendChild(createInput("Iterable", element.getAttribute('t-iterable'), uuid, "Iterable", "t-iterable"));
                        iterableGroup.appendChild(createInput("Element name", element.getAttribute('t-element-name'), uuid, "Element name", "t-element-name"));
                        dynamicInputs.appendChild(iterableGroup);
                        break;
                }
            });
            
            return;
        }

        fieldsToShow.forEach(field => {
            switch (field) {
                case 1:
                    dynamicInputs.appendChild(createCheckbox("Required", element.hasAttribute('t-required'), uuid, "t-required"));
                    break;
                case 2:
                    dynamicInputs.appendChild(createInput("Default", element.getAttribute('t-default'), uuid, "Default", "t-default"));
                    dynamicInputs.appendChild(createInput("Widget", element.getAttribute('t-widget'), uuid, "Widget", "t-widget"));
                    break;
                case 3:
                    const keyValueGroup = document.createElement('div');
                    keyValueGroup.classList.add('row');
                    keyValueGroup.appendChild(createInput("Key", element.getAttribute('t-key'), uuid, "Key", "t-key"));
                    keyValueGroup.appendChild(createInput("Value", element.getAttribute('t-value'), uuid, "Value", "t-value"));
                    dynamicInputs.appendChild(keyValueGroup);
                    break;
                case 4:
                    const minLengthGroup = document.createElement('div');
                    minLengthGroup.classList.add('row');
                    minLengthGroup.appendChild(createNumberInput("Minimum length", element.getAttribute('t-min-length'), uuid, "Minimum length", "t-min-length"));
                    minLengthGroup.appendChild(createNumberInput("Minimum", element.getAttribute('t-minimum'), uuid, "Minimum", "t-minimum"));
                    minLengthGroup.appendChild(createNumberInput("Maximum length", element.getAttribute('t-max-length'), uuid, "Maximum length", "t-max-length"));
                    dynamicInputs.appendChild(minLengthGroup);
                    break;
                case 7:
                    dynamicInputs.appendChild(createInput("Description", element.getAttribute('t-description'), uuid, "Description", "t-description"));
                    break;
                case 8:
                    dynamicInputs.appendChild(createInput("Enum", element.getAttribute('t-enum'), uuid, "Enum", "t-enum"));
                    break;
                case 99:
                    const iterableGroup = document.createElement('div');
                    iterableGroup.classList.add('row');
                    iterableGroup.appendChild(createInput("Iterable", element.getAttribute('t-iterable'), uuid, "Iterable", "t-iterable"));
                    iterableGroup.appendChild(createInput("Element name", element.getAttribute('t-element-name'), uuid, "Element name", "t-element-name"));
                    dynamicInputs.appendChild(iterableGroup);
                    break;
                case 100:
                    const referenceGroup = document.createElement('div');
                    referenceGroup.classList.add('row');
                    referenceGroup.appendChild(createInput("Reference/Foreign-key", element.getAttribute('t-reference'), uuid, "Reference/Foreign-key", "t-reference"));
                    referenceGroup.appendChild(createInput("Related name", element.getAttribute('t-related-name'), uuid, "Related name", "t-related-name"));                    
                    dynamicInputs.appendChild(referenceGroup);
                    break;
            }
        });
    }

    function getFieldsForType(type) {
        const fieldMappings = {
            string: [1, 2, 3, 4, 5, 6, 7, 9],
            number: [1, 2, 4, 5, 6, 7, 8, 9],
            integer: [1, 2, 4, 5, 6, 7, 8, 9],
            boolean: [7],
            duration: [2, 7, 9],
            Color: [2, 7, 8, 9],
            Email: [1, 2, 5, 7],
            Hostname: [1, 2, 7, 9],
            Ipv4: [1, 2, 7, 9],
            Ipv6: [1, 2, 7, 9],
            Iri: [1, 2, 7, 9],
            IriReference: [1, 2, 7, 9],
            Uri: [1, 2, 7, 9],
            UriReference: [1, 2, 7, 9],
            RichText: [1, 2, 3, 4, 5, 6, 7, 9],
            Text: [1, 2, 3, 4, 5, 6, 7, 9],
            date: [1, 2, 7],
            datetime: [1, 2, 7],
            time: [1, 2, 7, 9],
            image: [1],
            iterable: [99],
            referance: [100],
        };
        return fieldMappings[type] || [];
    }

    function createMetaFields() {
        if (!metaForm) return;
        metaForm.innerHTML = ''; // Clear the meta tab
        for (const key in contentJson.meta) {
            const elementData = contentJson.meta[key];
            const name = elementData.name || elementData.property;
            if (name === undefined || name === null) continue;
            const labelText = `Meta: ${name}`;
            metaForm.appendChild(createInput(labelText, elementData.content, key, labelText, "content"));
        }
    }

    function createImageFields() {
        if (!tabImages) return;
        tabImages.innerHTML = ''; // Clear the images tab
        for (const key in contentJson.images) {
            const elementData = contentJson.images[key];
            const div = document.createElement('div');
            div.classList.add('card', 'mb-3', 'p-3');
            div.appendChild(createInput("Field Name", elementData.field_name, key, "Field Name", "t-field"));
            div.appendChild(createInput("Src", elementData.src, key, "Src", "src"));
            div.appendChild(createInput("Alt Text", elementData.alt, key, "Alt Text", "alt"));
            div.appendChild(createInput("Class", elementData.class, key, "Class", "class"));
            div.appendChild(createInput("Style", elementData.style, key, "Style", "style"));
            tabImages.appendChild(div);
        }
    }

    function attachClickHandler(doc) {
        if (!doc) return;
        doc.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.ctrlKey || e.metaKey) {
                // Multi-select logic
                e.target.classList.toggle('selected');
                const uuid = e.target.getAttribute('data-uuid');
                if (e.target.classList.contains('selected')) {
                    selectedElements.push(uuid);
                } else {
                    selectedElements = selectedElements.filter(id => id !== uuid);
                }
                updateSelectionCount();
            } else {
                // Single select logic
                if (selectedElement) {
                    selectedElement.classList.remove('selected');
                }
                selectedElement = e.target;
                selectedElement.classList.add('selected');
                const uuid = selectedElement.getAttribute('data-uuid');
                selectedElements = [uuid];
                createFormForElement(uuid);
                updateParentDropdown(selectedElement);
                updateSelectionCount();
            }
        });
    }

    function updateSelectionCount() {
        if (!selectionCount) return;
        selectionCount.textContent = `Selected Elements: ${selectedElements.length}`;
    }

    function updateParentDropdown(element) {
        if (!parentDropdown) return;
        parentDropdown.innerHTML = ''; // Clear the dropdown
        let current = element;
        for (let i = 0; i < 5; i++) {
            if (current.parentElement) {
                current = current.parentElement;
                const option = document.createElement('option');
                const uuid = current.getAttribute('data-uuid') || generateUuid();
                current.setAttribute('data-uuid', uuid);
                option.value = uuid;
                option.textContent = generateFieldName(current);
                parentDropdown.appendChild(option);
            } else {
                break;
            }
        }
    }

    parentDropdown?.addEventListener('change', () => {
        iframeDoc.querySelectorAll('[style*="border: 1px dashed red"]').forEach(el => el.style.border = '');
        const selectedValue = parentDropdown.value;
        const parentElement = iframeDoc.querySelector(`[data-uuid="${selectedValue}"]`);
        if (parentElement) {
            parentElement.style.border = "1px dashed red";
        }
    });

    document.getElementById('generateButton')?.addEventListener('click', () => {
        const updatedHtml = generateUpdatedHtml();
        navigator.clipboard.writeText(updatedHtml).then(() => {
            alert('HTML copied to clipboard!');
        });
    });

    document.getElementById('groupButton')?.addEventListener('click', () => {
        if (selectedElements.length > 1) {
            const firstElement = iframeDoc.querySelector(`[data-uuid="${selectedElements[0]}"]`);
            const parent = firstElement.parentElement;
            const div = iframeDoc.createElement('div');
            div.setAttribute('data-uuid', generateUuid());
            selectedElements.forEach(uuid => {
                const element = iframeDoc.querySelector(`[data-uuid="${uuid}"]`);
                div.appendChild(element);
            });
            parent.appendChild(div);
            div.classList.add('selected');
            addGroupIcon(div);
            selectedElements = [div.getAttribute('data-uuid')];
            createFormForElement(div.getAttribute('data-uuid'));
            updateSelectionCount();
        } else {
            alert('Please select multiple elements to group.');
        }
    });

    document.getElementById('visualizeButton')?.addEventListener('click', () => {
        const selectedValue = parentDropdown.value;
        const parentElement = iframeDoc.querySelector(`[data-uuid="${selectedValue}"]`);
        if (parentElement) {
            addVisualizeIcon(parentElement);
            parentElement.style.border = '';
        }
    });

    document.getElementById('loadButton')?.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput?.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const htmlContent = e.target.result;
                loadHtmlFromString(htmlContent);
            };
            reader.readAsText(file);
        }
    });

    document.getElementById('saveButton')?.addEventListener('click', () => {
        const updatedHtml = generateUpdatedHtml();
        const blob = new Blob([updatedHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.html';
        a.click();
        URL.revokeObjectURL(url);
    });

    function addGroupIcon(div) {
        const icon = iframeDoc.createElement('div');
        icon.textContent = '?';
        icon.style.position = 'absolute';
        icon.style.top = '-10px';
        icon.style.right = '-10px';
        icon.style.width = '15px';
        icon.style.height = '15px';
        icon.style.backgroundColor = 'blue';
        icon.style.color = 'white';
        icon.style.fontSize = '10px';
        icon.style.textAlign = 'center';
        icon.style.lineHeight = '15px';
        icon.style.cursor = 'pointer';
        icon.style.borderRadius = '50%';
        icon.style.padding = '3px';
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            const uuid = div.getAttribute('data-uuid');
            createFormForElement(uuid);
        });
        div.style.position = 'relative';
        div.appendChild(icon);
    }

    function addVisualizeIcon(element) {
        let icon = element.querySelector('[style*="position: absolute"]');
        if (!icon) {
            icon = iframeDoc.createElement('div');
            icon.textContent = '?';
            icon.style.position = 'absolute';
            icon.style.top = '-10px';
            icon.style.right = '-10px';
            icon.style.width = '15px';
            icon.style.height = '15px';
            icon.style.backgroundColor = 'blue';
            icon.style.color = 'white';
            icon.style.fontSize = '10px';
            icon.style.textAlign = 'center';
            icon.style.lineHeight = '15px';
            icon.style.cursor = 'pointer';
            icon.style.borderRadius = '50%';
            icon.style.padding = '3px';
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                const uuid = element.getAttribute('data-uuid');
                createFormForElement(uuid);
                element.style.border = "1px dashed red";
            });
            element.style.position = 'relative';
            element.dataset.container = 'true';
            element.appendChild(icon);
        }
    }

    document.querySelectorAll('.tab-link').forEach(tabLink => {
        tabLink.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
            const tabElement = document.getElementById(`tab-${tabLink.dataset.tab}`);
            if (tabElement) {
                tabElement.classList.add('active');
            }
            tabLink.classList.add('active');
        });
    });

    // Activate the first tab by default
    const firstTabLink = document.querySelector('.tab-link[data-tab="field-input"]');
    if (firstTabLink) {
        firstTabLink.classList.add('active');
    }
    const firstTab = document.getElementById('tab-field-input');
    if (firstTab) {
        firstTab.classList.add('active');
    }

    // Dynamically load HTML content from a URL
    function loadHtmlFromUrl(url) {
        fetch(url)
            .then(response => response.text())
            .then(html => loadHtmlFromString(html))
            .catch(err => console.error('Failed to load HTML:', err));
    }

    function loadHtmlFromString(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        addDataUuids(doc.head);
        addDataUuids(doc.body);
        makeImagePathsAbsolute(doc.body, iframe.src);
        convertMetaTags(doc);
        iframeDoc.open();
        iframeDoc.write(doc.documentElement.outerHTML);
        iframeDoc.close();
        attachClickHandler(iframe.contentWindow.document);
        generateJsonFromHtml();
    }

    function generateUpdatedHtml() {
        iframeDoc.querySelectorAll('[style*="position: absolute"]').forEach(icon => icon.remove());
        iframeDoc.querySelectorAll('[style*="border: 1px dashed red"]').forEach(el => el.style.border = '');
        return iframeDoc.documentElement.outerHTML;
    }

    function generateJsonFromHtml() {
        const elements = iframeDoc.querySelectorAll('[data-uuid]');
        elements.forEach(el => {
            const uuid = el.getAttribute('data-uuid');
            const tag = el.tagName.toLowerCase();
            const fieldName = el.getAttribute('t-field') || generateFieldName(el);
            
            if (tag === 'img') {
                contentJson.images[uuid] = {
                    src: el.getAttribute('src'),
                    alt: el.getAttribute('alt'),
                    field_name: fieldName,
                    attribute: 'src',
                    class: el.getAttribute('class'),
                    style: el.getAttribute('style')
                };
            } else if (tag === 'a') {
                contentJson.links[uuid] = {
                    href: el.getAttribute('href'),
                    text: el.innerText,
                    field_name: fieldName,
                    attribute: 'href'
                };
            } else if (tag === 'meta') {
                let name = el.getAttribute('name') || el.getAttribute('property');
                if (name !== null && name !== undefined) {
                    name = name.replaceAll(':', '_');
                    name = name.replaceAll("-", "_");
                    name = `meta_${name}`;
                    contentJson.meta[uuid] = {
                        name: name,
                        content: el.getAttribute('content'),
                        field_name: `page.${name}`,
                        attribute: 'content'
                    };                        
                }
            } else {
                const tAttributes = {};
                Array.from(el.attributes).forEach(attr => {
                    if (attr.name.startsWith('t-')) {
                        tAttributes[attr.name] = attr.value;
                    }
                });
    
                // Check for background image in style attribute
                let backgroundImage = null;
                const style = el.getAttribute('style');
                if (style) {
                    const match = style.match(/background-image\s*:\s*url\(["']?([^"']+)["']?\)/);
                    if (match) {
                        let imageUrl = match[1];
                        if (!imageUrl.startsWith('http')) {
                            // Make the URL absolute
                            const baseUrl = new URL(iframe.src).origin;
                            imageUrl = new URL(imageUrl, baseUrl).href;
                        }
                        backgroundImage = imageUrl;
                        
                        // Add background image to contentJson.images
                        contentJson.images[uuid] = {
                            src: imageUrl,
                            field_name: fieldName,
                            attribute: 'background-image',
                            class: el.getAttribute('class'),
                            style: el.getAttribute('style')
                        };
                    }
                }
    
                contentJson.text[uuid] = {
                    tag: tag,
                    text: el.innerText,
                    field_name: fieldName,
                    attribute: 'innerText',
                    background_image: backgroundImage,
                    ...tAttributes
                };

                if (tag === 'div' && el.hasAttribute('t-field')) {
                    addVisualizeIcon(el);
                }                
            }
        });
        createMetaFields();
        createImageFields();
    }
        
    function addFieldTypeSelect(formElement, is_container_element) {
        const div = document.createElement('div');
        div.classList.add('mb-3');
    
        const label = document.createElement('label');
        label.setAttribute('for', 'fieldType');
        label.textContent = 'Field Type:';
        label.classList.add('form-label');
        div.appendChild(label);
    
        const select = document.createElement('select');
        select.id = 'fieldType';
        select.classList.add('form-select');
    
        let options = is_container_element ? ['string', 'iterable'] : [
            'string', 'number', 'integer', 'boolean', 'duration', 'Color', 'Email',
            'Hostname', 'Ipv4', 'Ipv6', 'Iri', 'IriReference', 'Uri', 'UriReference',
            'RichText', 'Text', 'date', 'datetime', 'time', 'image', 'iterable', 'reference',
        ];
    
        options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            select.appendChild(option);
        });
    
        div.appendChild(select);
        formElement.appendChild(div);

        select.addEventListener('change', () => {
            const uuid = dynamicForm.querySelector('input')?.dataset.uuid;
            const element = iframeDoc.querySelector(`[data-uuid="${uuid}"]`);
            if (element) {
                const is_container_element = element.dataset.container !== undefined;
                element.setAttribute('t-type', document.getElementById('fieldType').value);
                generateDynamicInputs(uuid, element, is_container_element);
            }
        });        
    }

    loadHtmlFromUrl('http://localhost:8001/base.html');
});
