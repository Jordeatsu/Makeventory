import React from "react";
import { Autocomplete, TextField, Divider, ListItem, ListItemText } from "@mui/material";

// United Kingdom and United States pinned first, then all others alphabetically
const PINNED    = ["United Kingdom", "United States of America"];
const ALL_ALPHA = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
    "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
    "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
    "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
    "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
    "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
    "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica",
    "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
    "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
    "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
    "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
    "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan",
    "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
    "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
    "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
    "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
    "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
    "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
    "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru",
    "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
    "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
    "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
    "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka",
    "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
    "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago",
    "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
    "United Arab Emirates", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];
const COUNTRIES = [...PINNED, ...ALL_ALPHA];

/**
 * Controlled country selector using MUI Autocomplete.
 *
 * Props:
 *   value      {string}           - currently selected country string
 *   onChange   {(string) => void} - called with the new country string
 *   required   {bool}
 *   error      {bool}
 *   helperText {string}
 */
export default function CountrySelect({ value = "", onChange, required, error, helperText, size = "small", ...rest }) {
    return (
        <Autocomplete
            freeSolo
            options={COUNTRIES}
            value={value}
            onChange={(_, newValue) => onChange(newValue ?? "")}
            onInputChange={(_, newValue, reason) => {
                // Only propagate typed values so the parent field stays in sync
                if (reason === "input") onChange(newValue);
            }}
            renderOption={(props, option, { index: _index }) => {
                const { key, ...optProps } = props;
                // Render a divider after the last pinned option
                const optionIndex = COUNTRIES.indexOf(option);
                return (
                    <React.Fragment key={key}>
                        {option === ALL_ALPHA[0] && (
                            <Divider component="li" sx={{ my: 0.5 }} />
                        )}
                        <ListItem {...optProps} dense>
                            <ListItemText primary={option} />
                        </ListItem>
                    </React.Fragment>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Country"
                    size={size}
                    fullWidth
                    required={required}
                    error={error}
                    helperText={helperText}
                />
            )}
            {...rest}
        />
    );
}
