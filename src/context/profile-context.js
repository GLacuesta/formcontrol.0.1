import React from 'react';

const profileContext = React.createContext({
    Name: '',
    Address: '',
    JobTitle: '',
    changed: () => {}
});

export default profileContext;  