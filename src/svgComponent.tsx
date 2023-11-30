import React, { Component } from "react";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { SVG } from "./svg";

interface ControlsProps {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
}

class Controls extends Component<ControlsProps> {
  render() {
    const { zoomIn, zoomOut, resetTransform } = this.props;

    return (
      <>
        <button onClick={zoomIn}>+</button>
        <button onClick={zoomOut}>-</button>
        <button onClick={resetTransform}>x</button>
      </>
    );
  }
}

interface SvgDragAndZoomState {
  isDragging: boolean;
  startPoint: { x: number; y: number };
  viewBox: { x: number; y: number; width: number; height: number };
}

class YourComponent extends Component<{}, SvgDragAndZoomState> {
  private transformComponentRef: React.RefObject<ReactZoomPanPinchRef>;
  svgUrl: string | undefined;

  constructor(props: {}) {
    super(props);
    this.transformComponentRef = React.createRef();
    this.state = {
      isDragging: false,
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: 0, height: 0 }, // Set initial viewBox dimensions
    };
  }

  componentDidMount = () => {
    this.getAndSetSvgSize();
  };

  zoomToImage = () => {
    console.log("here");
    if (this.transformComponentRef.current) {
      console.log(this.transformComponentRef.current, "kristina");
      const { zoomToElement } = this.transformComponentRef.current;
      zoomToElement("imgExample");
    }
  };

  getAndSetSvgSize() {
    const svgSize = document
      .getElementsByClassName("svg")[0]
      .getElementsByTagName("svg")[0]
      .getBBox();
    this.setState({
      isDragging: false,
      startPoint: { x: 0, y: 0 },
      viewBox: { x: 0, y: 0, width: svgSize.width, height: svgSize.height }, // Update viewBox after getting the svg dimensions
    });
  }

  render() {
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

    if (viewBox.width !== 0 && viewBox.height !== 0) {
      // const svgTest = `${`data:image/svg+xml;utf8,${encodeURIComponent(modifiedSvgString)}`}`
      const blob = new Blob([modifiedSvgString], { type: "image/svg+xml" });
      this.svgUrl = URL.createObjectURL(blob);
      console.log(this.svgUrl);
    }

    console.log("svgDocument", svgDocument);
    return (
      <TransformWrapper
        initialScale={1}
        initialPositionX={200}
        initialPositionY={100}
        ref={this.transformComponentRef}
      >
        {(utils) => (
          <React.Fragment>
            <Controls
              zoomIn={utils.zoomIn}
              zoomOut={utils.zoomOut}
              resetTransform={utils.resetTransform}
            />
            <TransformComponent>
              {this.svgTest === "" && (
                <div
                  dangerouslySetInnerHTML={{ __html: modifiedSvgString }}
                  className="svg"
                />
              )}
              {/* <div
                id="imgExample"
                dangerouslySetInnerHTML={{ __html: modifiedSvgString }}
                className="svg"
                style={{ width: "1000px", height: "1000px" }}
              />
              <div onClick={this.zoomToImage}>Example text</div> */}
              <img src={svgUrl} alt="test" id="imgExample" />
            </TransformComponent>
          </React.Fragment>
        )}
      </TransformWrapper>
    );
  }
}

export default YourComponent;
