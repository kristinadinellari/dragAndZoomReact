import React from 'react';
import * as d3 from 'd3';
import { SVG } from "./svg";

interface ZoomableSVGProps {}

class SvgDragAndZoom extends React.Component<ZoomableSVGProps> {
   svgRef: React.RefObject<SVGSVGElement>;
  // svgRef: React.RefObject<HTMLDivElement>;
  svgDocument: Document;

  constructor(props: ZoomableSVGProps) {
    super(props);
    this.svgRef = React.createRef();
    const parser = new DOMParser();
    this.svgDocument = parser.parseFromString(SVG, "image/svg+xml");
  }

  componentDidMount() {
    this.initializeZoom();
  }
  
  initializeZoom() {
    const svg = d3.select(this.svgRef.current);
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        svg.attr("transform", event.transform.toString());
      }) as any;

    svg.call(zoom);
  }

  render() {
    const modifiedSvgString = new XMLSerializer().serializeToString(
      this.svgDocument
    );
    return (
      <div >
            <svg
                  ref={this.svgRef}
                  dangerouslySetInnerHTML={{ __html: modifiedSvgString }}
                  className="svg"
                  style={{ width: "100%", height: "100%"}}
            >

            </svg>
            
      </div>
    );
  }
}

export default SvgDragAndZoom;

