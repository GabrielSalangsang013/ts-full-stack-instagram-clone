import { ReactNode } from 'react';
import style from './Container.module.css';

interface ContainerProps {
    children: ReactNode;
}

const Container = ({children}: ContainerProps) => {
    return (
        <div className={`${style.container}`}>
            {children}
        </div>
    )
}

export default Container;