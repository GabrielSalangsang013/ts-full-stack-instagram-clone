import '../../pages/globals.css';

type LayoutProps = {
    children: React.ReactNode;
};

const Layout = ({children}: LayoutProps) => {
    return (
        <div className="flex">
            {children}
        </div>
    )
}

export default Layout;