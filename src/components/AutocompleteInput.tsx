import React, { useEffect, useState, useRef } from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Button, OverlayTrigger } from 'react-bootstrap';
import { BiRefresh } from 'react-icons/bi';
import { BsPencilFill } from "react-icons/bs"
import axios from "axios"
import config from "../config/config.json"


const AutocompleteInput = (props: any) => {
    const [options, setOptions] = useState([]);
    const inputRef = useRef<HTMLInputElement>(null);

    //Init Lora
    useEffect(() => {
        // Update SheetsList
        handleRefreshAutoComplete()

    }, []);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.scrollLeft = inputRef.current.scrollWidth - inputRef.current.offsetWidth + 100;
        }

        const autoSetSelectedSheet = () => {

            //Since DB tables name are different than folder, need to change name for matching
            let pathArray = []
            for (let sheetName of props.sheetsList) {
                if (sheetName === "Type Character") {
                    pathArray.push("Type")
                } else {
                    pathArray.push(sheetName)
                }
            }

            //Find First Match
            let firstMatch = null;
            if (!(props.downloadFilePath === null || props.downloadFilePath.length === 0)) {
                for (let sheetName of pathArray) {
                    if (props.downloadFilePath.includes(sheetName)) {
                        if (firstMatch === null || props.downloadFilePath.indexOf(sheetName) < props.downloadFilePath.indexOf(firstMatch)) {
                            firstMatch = sheetName;
                        }
                    }
                }
            }

            //Changing back for setting sheet
            if (firstMatch === "Type") {
                firstMatch = "Type Character"
            } else if (firstMatch === null) {
                firstMatch = props.selectedSheet
            }
            props.setSelectedSheet(firstMatch);

        }

        autoSetSelectedSheet()

    }, [props.downloadFilePath]);

    const handleRefreshAutoComplete = async () => {
        console.log('Calling handleRefreshAutoComplete');
        props.setIsLoading(true)
        try {
            const response = await axios.get(`${config.domain}/api/list-autocomplete`);
            setOptions(response.data)
        } catch (error: any) {
            console.error(error);
            props.errorhandler(error)
        } finally {
            props.setIsLoading(false)
        }
    };

    const handleAutoCompleteOnChange = (event: any, newValue: string | null) => {


        if (newValue === "" || newValue === null || newValue === undefined || newValue.length === 0) {
            return
        }

        const disallowedRegex = /[<>:"\\\|?*]/g;

        // Remove disallowed characters from the input
        let input = newValue?.replace(disallowedRegex, '');

        props.setdownloadFilePath(input)
    }

    return <div className="sheet-selection d-flex align-items-center">
        <Autocomplete
            value={props.downloadFilePath}
            onChange={handleAutoCompleteOnChange}
            onInputChange={handleAutoCompleteOnChange}
            id="controllable-states-demo"
            options={options}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} inputRef={inputRef} helperText={`Folder name can't contain '"<>:/\|?*'`}
                label="Folder path" onFocus={() => {
                    if (inputRef.current) {
                        inputRef.current.scrollLeft = inputRef.current.scrollWidth - inputRef.current.offsetWidth + 100;
                    }
                }} />}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <OverlayTrigger placement="bottom" overlay={props.renderTooltip('Save Current Download File Path')}>
                <Button variant="light" disabled={props.isLoading} style={{}} onClick={() => { chrome.storage.sync.set({ downloadFilePath: props.downloadFilePath }); }}>
                    <BsPencilFill />
                </Button>
            </OverlayTrigger>

            <OverlayTrigger placement="bottom" overlay={props.renderTooltip('Get Auto Complete List')}>
                <Button variant="light" disabled={props.isLoading} style={{}} onClick={handleRefreshAutoComplete}>
                    <BiRefresh />
                </Button>
            </OverlayTrigger>
        </div>
    </div>

}

export default AutocompleteInput