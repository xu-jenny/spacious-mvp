interface ISidebarText {
  id: string;
  text: string;
  page: number;
}
interface Props {
  texts: Array<ISidebarText>;
  handleJumpToPage: (page: number) => void;
}

export function PDFPanelSidebar({ texts, handleJumpToPage }: Props) {
  const longStringShortener = (str: string) =>
    str != null && str.length > 135 ? `${str.substring(0, 135)}...` : str;

  return (
    <div className="sidebar" style={{ overflow: "auto", height: "80vh" }}>
      <ul className="p-0">
        {texts.map((text, index) => (
          <li
            key={index}
            className="list-none p-0 mr-1 cursor-pointer"
            onClick={() => {
              handleJumpToPage(text.page);
            }}
          >
            <p>{longStringShortener(text.text)}</p>
            <div className="text-right text-xs">Page {text.page}</div>
            <hr className="p-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}
