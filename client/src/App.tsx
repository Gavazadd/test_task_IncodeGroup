import React, {FC, useContext, useEffect, useState} from 'react';
import LoginForm from "./components/LoginForm";
import {Context} from "./index";
import {observer} from "mobx-react-lite";
import {IUser} from "./models/IUser";
import UserService from "./services/UserService";

const App: FC = () => {
    const {store} = useContext(Context);
    const [users, setUsers] = useState<IUser[]>([]);
    const [freeUsers, setFreeUsers] = useState<IUser[]>([]);


    useEffect(() => {
        if (localStorage.getItem('token')) {
            store.checkAuth()
        }
    }, [])

    async function getUsers() {
        try {
            const response = await UserService.fetchUsers(store.user.role, store.user.id);
            setUsers(response.data);
        } catch (e) {
            alert(e.response.data.message)
        }
    }

    async function getFreeUsers() {
        try {
            const response = await UserService.fetchFreeUsers();
            setFreeUsers(response.data);
        } catch (e) {
            alert(e.response.data.message)
        }
    }

    async function makeSubordinated() {
        try {
            await UserService.makeSubordinated(store.user.id, freeUsers[0]._id);
            window.location.reload()
        } catch (e) {
            alert(e.response.data.message)
        }
    }


    if (store.isLoading) {
        return <div>Загрузка...</div>
    }

    if (!store.isAuth) {
        return (
            <div>
                <LoginForm/>
                <button onClick={getUsers}>Отримати користувачів</button>
            </div>
        );
    }

    return (
        <div>
            <h1>{store.user.isActivated ? `Пошту підтверджено ${store.user.email}` : `ПІДТВЕРДЬТЕ ПОШТУ!!!! ${store.user.email}`}</h1>
            <h1>Ваша роль {store.user.role}</h1>
            <button onClick={() => store.logout()}>Выйти</button>
            {store.user.role === 'BOSS' ?
                <div>
                    <button onClick={getFreeUsers}>Найняти користувачів</button>
                    {freeUsers.map(user =>
                        <p>
                            <div key={user.email}>{`${user.email}`}</div>
                            <button onClick={makeSubordinated} >

                                Найняти
                            </button>
                        </p>

                    )}
                </div>
                :
                null
            }
            <div>
                <button onClick={getUsers}>Отримати користувачів</button>
            </div>
            {users.map(user =>
                <div key={user.email}>{`${user.email} - ${user.role}`}</div>
            )}
            </div>
    );
};

export default observer(App);
