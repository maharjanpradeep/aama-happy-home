// Renders plain text with any http(s) URLs turned into clickable links.
// Splitting on a capturing group puts the URLs at the odd indexes.
const URL_RE = /(https?:\/\/[^\s]+)/g;

const Linkify = ({ text }: { text: string }) => (
  <>
    {text.split(URL_RE).map((part, i) =>
      i % 2 ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline break-all"
        >
          {part}
        </a>
      ) : (
        part
      ),
    )}
  </>
);

export default Linkify;
