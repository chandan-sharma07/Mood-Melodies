import React from "react";

const FormGroup = ({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    }) => {
    const id = label.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="form-group">
        <label htmlFor={id}>{label}</label>

        <input
            id={id}
            name={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
        </div>
    );
};

export default FormGroup;