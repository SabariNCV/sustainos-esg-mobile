import styled  from "styled-components";
import { Container,Typography} from "@mui/material";

export const Heading = styled(Typography)`
    color: ${(props)=>props.fontColor};
    background:${(props)=>props.fontBgColor};
    border-bottom: 2px solid #EEEEEE;
    padding: 10px 0px 10px 20px;
    font-family: ${(props)=>props.fontFamilyIs} !important;
    font-size:${(props)=>props.fontSize};
    font-weight: ${(props) => (props.boldFont ? 'bold' : 'normal')} !important;
    font-style: ${(props) => (props.italicFont ? 'italic' : 'normal')};
    text-decoration: ${(props) => (props.underLineFont ? 'underline' : 'none')}; 
`;