import sanitizeHtml from 'sanitize-html';

export function cleanHTML(dirty: string) {
    return sanitizeHtml(dirty, {
        allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'p', 'span', 'br' ],
        transformTags: {
            'div': sanitizeHtml.simpleTransform('p', {}),
        },
        allowedAttributes: {
            'span': [ 'class', 'data-timestamp', 'data-meta', 'contentEditable', 'style', 'title' ]
        }
    });
};
