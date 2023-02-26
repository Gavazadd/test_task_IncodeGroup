import React, {FC, useContext, useState} from 'react';
import {Context} from "../index";
import {observer} from "mobx-react-lite";

const LoginForm: FC = () => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [role, setRole] = useState<string>('')
    const {store} = useContext(Context);

    return (
        <div>
            <p>
                Під час реєстрації виберіть собі роль
            </p>
            <p>
                Можливі типи ролей: USER, BOSS, ADMIN
            </p>
            <input
                onChange={e => setEmail(e.target.value)}
                value={email}
                type="text"
                placeholder='Email'
            />
            <input
                onChange={e => setPassword(e.target.value)}
                value={password}
                type="password"
                placeholder='Пароль'
            />
            <input
                onChange={e => setRole(e.target.value)}
                value={role}
                type="text"
                placeholder='Роль'
            />

            <button onClick={() => store.login(email, password)}>
                Логін
            </button>
            <button onClick={() => store.registration(email, password, role)}>
                Реєстрація
            </button>
        </div>
    );
};

export default observer(LoginForm);
