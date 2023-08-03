import React, { useEffect, useState, useRef, CSSProperties } from "react";
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
    BsCheck, BsArrowRepeat, BsStarFill, BsStar, BsDownload, BsFillClipboardPlusFill,
    BsFillClipboard2PlusFill, BsFillFileEarmarkArrowUpFill, BsInfoCircleFill, BsFillClipboard2XFill
} from 'react-icons/bs';


const FunctionButton = (props: any) => {
    const buttonRef = useRef(null);
    const [apiSuccess, setApiSuccess] = useState(false);

    const renderTooltip = (tooltipText: any) => (
        <Tooltip id="tooltip">{tooltipText}</Tooltip>
    );

    // Function to handle the API call and update the button state
    const handleButtonClick = async () => {
        try {
            setApiSuccess(true);
            await props.b_handleApiCall();
            setApiSuccess(false);
        } catch (error) {

        }

    };

    const b_style_success: CSSProperties = { position: "relative", transition: 'opacity 0.5s ease', opacity: "0.5", ...props.b_style }
    const b_style_fail: CSSProperties = { position: "relative", transition: 'opacity 0.5s ease', opacity: props.b_disabled ? "0.5" : "1", ...props.b_style }

    const s_style_success: CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        color: "black",
        transform: 'translate(-50%, -50%)',
        opacity: '0.5',
    }

    return (
        <OverlayTrigger placement={props.b_placement} overlay={renderTooltip(props.b_tooltip)}>
            <Button
                ref={buttonRef}
                variant={props.b_variant}
                onClick={handleButtonClick}
                disabled={props.b_disabled}
                style={apiSuccess ? b_style_success : b_style_fail}
            >
                {props.isFavorite === undefined ? (props.b_icon) : (props.isFavorite ? props.b_icon : props.b_icon_alter)}
                {apiSuccess ? <span style={s_style_success}>✓</span> : null}
            </Button>
        </OverlayTrigger>
    );

}



export default FunctionButton;