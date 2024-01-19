// I had to remove ts-check because it was preventing me from adding properties to the Draggable component.
// In the ea repository, this works perfectly fine, as I attempted to add the properties to the existing implementation there.

// @ts-nocheck
import { Component } from "react";
import Draggable from "react-draggable";
import { bigSvg } from "./big-svg";
import { smallSvg } from "./small-svg";

interface SvgDragAndZoomState {
  viewBox: { x: number; y: number; width: number; height: number };
  zoomScale: number;
  showDialog: boolean;
  disablePanning: boolean;
}

enum SCALE {
  default = 0.1,
  min = 0.2,
  max = 2,
}

class SvgDragAndZoom extends Component<{}, SvgDragAndZoomState> {
  svgDocument: Document;
  currentColor: string;
  mouseInside = false; // for better handling of event occurrences
  clickOnce = false; // for better handling of event occurrences
  stopInteraction = false; // to disable an iteraction of svg when dialog is snown
  draggingStarted = false;
  draggingHappend = false;
  // hardcoded ids from smallSvg
  mockData = { 
    discoveredModel: {
      activityIds: {
        "Parked": "act_8",
        "Submitted": "act_0",
        "Target of Opportunity": "act_7"
      },
      flowIds: {
        "Parked->__PROCESS_END__": "df_8--3",
        "Submitted->Parked": "df_0-8",
        "Submitted->Target of Opportunity": "df_0-7",
        "Target of Opportunity->__PROCESS_END__": "df_7--3",
        "__PROCESS_START__->Submitted": "df_-2-0"
      },
      // "svg": <svg....</svg> (smallSvg)
    }
  }
  // very small example of hardcoded ids from bigSvg
  // mockData = { 
  //   discoveredModel: {
  //     activityIds: {
  //       "Backlog": "act_0",
  //       "Blocked": "act_13",
  //       "Closed": "act_2",
  //       "In Progress": "act_1",
  //     },
  //     flowIds: {
  //       "Closed->In Progress": "df_2-1",
  //       "__PROCESS_START__->Remediated": "df_-2-3",
  //       "Backlog->To Do": "df_0-15",
  //       "Support Awaiting Customer->Closed": "df_5-2",
  //       "Backlog->Blocked": "df_0-13",
  //     },
  //     // "svg": <svg....</svg> (smallSvg)
  //   }
  // }

  constructor(props: {}) {
    super(props);

    const parser = new DOMParser();
    this.svgDocument = parser.parseFromString(smallSvg, "image/svg+xml");

    this.state = {
      viewBox: { x: 0, y: 0, width: 0, height: 0 }, // Set initial viewBox dimensions
      zoomScale: 1, // Default zoom sensitivity
      position: { x: 0, y: 0 },
      showDialog: false,
      disablePanning: false,
    };
  }

  componentDidMount = () => {
    this.updateSvgSize();
  };

  componentDidUpdate = () => {
    this.setStyle();
    this.interactiveModel();
  };

  updateSvgSize() {
    const svgSize = document
      .getElementsByClassName("svg")[0]
      .getElementsByTagName("svg")[0]
      .getBBox();
    this.setState({
      viewBox: { x: 0, y: 0, width: svgSize.width, height: svgSize.height }, // Update viewBox after getting the svg dimensions
    });
  }

  zoomIn = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState((prevState) => ({
      // we need to change the max value with the one that PO will add on Spec document.
      zoomScale:
        this.state.zoomScale >= SCALE.max
          ? SCALE.max
          : prevState.zoomScale + SCALE.default,
    }));
  };

  zoomOut = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState((prevState) => ({
      // we need to change the min value with the one that PO will specify on the Spec document
      zoomScale:
        this.state.zoomScale <= SCALE.min
          ? SCALE.default
          : prevState.zoomScale - SCALE.default,
    }));
  };

  zoomReset = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState(() => ({
      zoomScale: 1,
      position: { x: 0, y: 0 },
    }));
  };

  // ------------------------ Spike - Interactive discover model - start //
  getKeyByValue = (object: any, value: string): string => {
    return Object.keys(object).find(key => object[key] === value);
  }

  removeProcessStartEnd = (array: string[]): string[] => {
    // Hardcoded strings coming from BE marking end and start nodes
    const PROCESS_START_END_VALUES = ['__PROCESS_START__', '__PROCESS_END__'];

    array.forEach((element: string) => {
      const index: number = PROCESS_START_END_VALUES.indexOf(element);
      if (index > -1) {
        array.splice(index, 1);
      }
    });

    return array;
  }

  setElementColor = (event, id: string, shouldHighlight: boolean) => {
    if (shouldHighlight) {
      this.currentColor = event.target.parentNode.querySelector(`[data-element-id="${id}"] g`).getAttribute('fill');
    }

    const activityColor = shouldHighlight ? 'yellow' : this.currentColor;
    const selectedElements = event.target.parentNode.querySelectorAll(`[data-element-id="${id}"] g`);

    selectedElements.forEach(element => {
      if (!activityColor) {
        return;
      }
      element.setAttribute('stroke', activityColor);
      element.setAttribute('fill', activityColor);
    });
  }

  updateElementColor = (event, flowName: string, shouldHighlight: boolean) => {
    const splitString = '->'; // is par of the BE response and it is always in use in this format to mark flow between activities
    const foundActivities: string[] = flowName.split(splitString);
    const nodes = this.removeProcessStartEnd(foundActivities);

    nodes.forEach((node: string) => {
      const id: string = this.mockData.discoveredModel.activityIds[node];
      if (id) {
        this.setElementColor(event, id, shouldHighlight);
      }
    });
  }

  interactiveModel = () => {
    const ids: string[] = [
      ...Object.values(this.mockData.discoveredModel.activityIds), 
      ...Object.values(this.mockData.discoveredModel.flowIds)
    ];

    if(!this.stopInteraction) {
      ids.forEach((id: string) => {
        const selectedElement = document.querySelectorAll(`[data-element-id="${id}"]`);
    
        if (!selectedElement[0]) {
          return;
        }
    
        (selectedElement[0] as any).style.cursor = 'pointer';
    
        (selectedElement[0] as any).addEventListener('click', (event) => {
          if(!this.clickOnce && !this.stopInteraction) {
            console.log('Click event is happening, draggingHappend: ', this.draggingHappend)

            if (this.draggingHappend ) {
              return;
            }

            const activityName = this.getKeyByValue(
              {
                ...this.mockData.discoveredModel.activityIds, 
                ...this.mockData.discoveredModel.flowIds
              }, 
              id
            );

            this.clickOnce = true;
            this.stopInteraction = true;

            this.setState({
              showDialog: true,
              disablePanning: true,
            });
    
            console.log('Click event is happening on the activity', activityName +  ' with id:', id)
          }
        });
    
        (selectedElement[0] as any).addEventListener('mouseenter', (event) => {
          if (!this.mouseInside && event.target?.parentNode) {
            this.mouseInside = true;
            this.setElementColor(event, id, true);
            
            const flowName: string = this.getKeyByValue(this.mockData.discoveredModel.flowIds, id);
            // on mouseenter when highlighting flow, then highlight start/end nodes as well
            if (flowName) {
              this.updateElementColor(event, flowName, true)
            }
          }
        });
        
        (selectedElement[0] as any).addEventListener('mouseleave', (event) => {
          if (this.currentColor && event.target?.parentNode) {
            this.mouseInside = false;
            this.setElementColor(event, id, false);
  
            const flowName: string = this.getKeyByValue(this.mockData.discoveredModel.flowIds, id);
            // on mouseleave remove the flow highlight color, as well as highlighted start/end nodes
            if (flowName) {
              this.updateElementColor(event, flowName, false)
            }
          }
        });
      })
    }
  };

  closeDialog = () => {
    this.clickOnce = false;
    this.stopInteraction = false;
    this.setState({
      showDialog: false,
      disablePanning: false,
    });
  }

  // ------------------------ Spike - Interactive discover model - end //

  setStyle = () => {
    const svgElement = document.getElementsByTagName("svg")[0];

    if (!svgElement) return;

    svgElement.style.transform = `scale(${this.state.zoomScale})`;
  };

  render() {
    const { viewBox } = this.state;
    const newViewBox = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;

    if (newViewBox) {
      const svgElement = this.svgDocument.querySelector("svg");
      if (svgElement) {
        svgElement.setAttribute("viewBox", newViewBox);
      }
    }

    const modifiedSvgString = new XMLSerializer().serializeToString(
      this.svgDocument
    );

    return (
      <div>
        <div
          className="action_buttons"
          style={{ display: "flex", justifyContent: "end" }}
        >
          <button onClick={this.zoomIn}>Zoom in</button>
          <button onClick={this.zoomOut}>Zoom out</button>
          <button onClick={this.zoomReset}>Reset</button>
        </div>

        <div className="svg_wrapper" style={{ width: "100%", height: "100%", overflow: "hidden", position: "relative" }}>
          <Draggable
            disabled={this.state.disablePanning}
            position={this.state.position}
            onStart={(e) => {
              this.draggingHappend = false; // needed to reset the value to its default state `false`
              this.draggingStarted = false;
              console.log('onStart draggingStarted --- ', this.draggingStarted);
            }}
            onDrag={(e, data) => {
              this.draggingStarted = true;
              console.log('onDrag draggingStarted --- ', this.draggingStarted);
              this.setState({ position: { x: data.x, y: data.y } })
            }}
            onStop={(e) => {
              console.log('onStop draggingStarted ---  ', this.draggingStarted);
              if (this.draggingStarted) {
                this.draggingHappend = true;
              }
              console.log('onStop draggingHappend ---  ', this.draggingHappend);
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: modifiedSvgString }}
              className="svg"
            />
          </Draggable>
          { this.state.showDialog &&
            <div 
              className="dialog" 
              style={{ position: "absolute", zIndex: "1000", top: "0", width: "30%", backgroundColor: "red", height: "inherit" }}>
                <p>I'm here</p>
                <button onClick={this.closeDialog}>Close</button>
            </div>  
          }
        </div>
      </div>
    );
  }
}

export default SvgDragAndZoom;
