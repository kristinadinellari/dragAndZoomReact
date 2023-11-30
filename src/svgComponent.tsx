import React from 'react';
import * as d3 from 'd3';

interface ZoomableSVGProps {}

class SvgDragAndZoom extends React.Component<ZoomableSVGProps> {
  private svgRef: React.RefObject<SVGSVGElement>;

  constructor(props: ZoomableSVGProps) {
    super(props);
    this.svgRef = React.createRef();
  }

  componentDidMount() {
    this.initializeZoom();
  }
  initializeZoom() {
    const svg = d3.select(this.svgRef.current);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        svg.attr("transform", event.transform.toString());
      }) as any;

    svg.call(zoom);
  }

  render() {
    return (
      <svg
        ref={this.svgRef}
        width={600}
        height={400}
        style={{ border: "1px solid black" }}
      >
        <circle cx={300} cy={200} r={50} fill="blue" />
      </svg>
    );
  }
}

export default SvgDragAndZoom;

