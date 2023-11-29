import React, { Component, createRef } from "react";
import { SVG } from "./svg"; 

import Panzoom from '@panzoom/panzoom'

interface SvgDragAndZoomState {
  isDragging: boolean;
  startPoint: { x: number; y: number };
  viewBox: { x: number; y: number; width: number; height: number };
}

class SvgDragAndZoom extends Component<{}, SvgDragAndZoomState> {
  panzoom: any
  
  constructor(props: {}) {
    super(props);

    this.state = {
      isDragging: false,
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: 0, height: 0 }, // Set initial viewBox dimensions
    };
  }

  componentDidMount = () => {
    this.getAndSetSvgSize();
    const elem = document.getElementById('panzoom-element')
    if (elem) {
      this.panzoom = Panzoom(elem, {
        maxScale: 50,
        cursor: 'grab'
      });
      document.getElementById('zoomIn')?.addEventListener('click', this.panzoom.zoomIn);
      document.getElementById('zoomOut')?.addEventListener('click', this.panzoom.zoomOut);
      elem.addEventListener('wheel', this.panzoom.zoomWithWheel);
    }
  }

  getAndSetSvgSize() {
    console.log('size: ', document.getElementsByClassName('svg')[0].getElementsByTagName('svg')[0].getBBox());
    const svgSize =  document.getElementsByClassName('svg')[0].getElementsByTagName('svg')[0].getBBox();
    this.setState({
      isDragging: false,
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: svgSize.width, height: svgSize.height }, // Update viewBox after getting the svg dimensions      
    });    
  }

  render() {
    console.log("Rendering: " + Date.now());
    const { viewBox } = this.state;
    const newViewBox = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
    const parser = new DOMParser();
    const svgDocument = parser.parseFromString(SVG, "image/svg+xml");

    if (newViewBox) {
      const svgElement = svgDocument.querySelector("svg");
      if (svgElement) {
        svgElement.setAttribute("viewBox", newViewBox);
      }
    }

    const modifiedSvgString = new XMLSerializer().serializeToString(
      svgDocument
    );

    return (
      <div        
        className="discoveredModel"        
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      >
        <div className="buttons" style={{ display: "flex", justifyContent: "center" }}>
          <button id="zoomIn" >Zoom out</button>
          <button id="zoomOut">Zoom in</button>
        </div>

        <div
          id="panzoom-element"
          dangerouslySetInnerHTML={{ __html: modifiedSvgString }}
          className="svg"
        />
      </div>
    );
  }
}

export default SvgDragAndZoom;
