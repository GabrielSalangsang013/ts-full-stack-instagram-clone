export default function replaceMentionsAndHashtagsWithLinks(text: string) {
    if (!text) {
        return { __html: '' }; // Return an empty HTML if text is undefined or empty
    }

    const replacedText = text
        .replace(
            /@(\w{3,})(?![\w.-])/g,
            '<a class="text-sky-500" href="/$1">@$1</a>'
        )
        .replace(
            /#(\w+)/g,
            '<a class="text-sky-500" href="/explore/tags/$1">#$1</a>'
        );

    return { __html: replacedText };
};