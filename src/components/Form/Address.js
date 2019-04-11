import React, { useContext } from 'react';

import Editable from '../Editable/Editable';
import ProfileContext from '../../context/profile-context';


const address = (props) => {
    const profileContext = useContext(ProfileContext);

    return <Editable 
        title={props.title}
        next={props.next}
        changed={profileContext.changed}
    />
};

export default address;