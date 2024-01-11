import "./widget.scss";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
const Widget = () => {
  return (
    <div className="widget">
      <div className="left">
        <span className="title">Title</span>
        <span className="counter">Counter Placeholder</span>
        <span className="link">Links</span>
      </div>
      <div className="right">
        <div className="percentage positive">
          <KeyboardArrowUpIcon />
          Nos
        </div>
        Icons
      </div>
    </div>
  );
};

export default Widget;
