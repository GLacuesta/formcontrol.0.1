import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import ProfileContext from '../../context/profile-context';

import classes from './Readonly.module.css';


const readonly = (props) => {
    const profileContext = useContext(ProfileContext);
    const labels = Object.keys(profileContext)
        .map(item => {
            if (typeof profileContext[item]==='function') return null;

            
            return <label key={item}>{item}: {profileContext[item]}</label>
        });

    return (
        <div className={classes.Readonly}>
            <Link to={props.next}><h1>Complete Information</h1></Link>
            {labels}
        </div>
    );
};

export default readonly;