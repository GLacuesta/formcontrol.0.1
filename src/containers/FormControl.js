import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import Aux from '../hoc/Auxiliary';
import ProfileContext from '../context/profile-context';

import Name from '../components/Form/Name';
import Address from '../components/Form/Address';
import JobTitle from '../components/Form/JobTitle';

import Readonly from '../components/Readonly/Readonly';
import { throws } from 'assert';



class FormControl extends Component {

    state = {
        form: [
            { id: 0, path: '/', component: <Name title="Name" next="/more-info" /> },
            { id: 1, path: '/more-info', component: <Address title="Address" next="/additional-info" />  },
            { id: 2, path: '/additional-info', component: <JobTitle title="JobTitle" next="/view-info" />  },
            { id: 3, path: '/view-info', component: <Readonly next="/"/>  }
        ],
        Name: '',
        Address: '',
        JobTitle: ''
    }

    static contextType = ProfileContext;

    changeDataHandler = (event) => {
        const profile = {...this.state};
        profile[event.target.name] = event.target.value;
        this.setState({
            ...profile
        });
    };

    render () {
        const routeEl = this.state.form.map(i => <Route key={i.id} path={i.path} exact render={() => i.component} />);

        return (
            <Aux>
                <ProfileContext.Provider value={{
                    Name: this.state.Name,
                    Address: this.state.Address,
                    JobTitle: this.state.JobTitle,
                    changed: this.changeDataHandler
                }}>
                    {routeEl}
                </ProfileContext.Provider>
            </Aux>
        )
    }
}

export default FormControl;