import React from 'react';
import { Link } from 'react-router-dom';
import Aux from '../../hoc/Auxiliary';

import classes from './Editable.module.css'

const editable = (props) => {
    return (
        <Aux>
        <div className={classes.Editable}>
            <h1>{props.title}</h1>
            <input type="text" 
                name={props.title} 
                onChange={props.changed}/>

            <Link to={props.next}>
                <button onClick={props.clicked}>Next</button>
            </Link>
        </div>
        </Aux>
    )
}

export default editable;