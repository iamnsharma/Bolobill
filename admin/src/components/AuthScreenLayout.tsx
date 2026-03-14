import { Link } from "react-router-dom";
import { ReactNode } from "react";
import authSideImg from "../assets/images/features/bb4.png";

type AuthScreenLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function AuthScreenLayout({ title, subtitle, children }: AuthScreenLayoutProps) {
  return (
    <div className="auth-screen min-vh-100 d-flex">
      <div className="auth-screen-left d-flex align-items-center justify-content-center p-4 p-lg-5">
        <div className="auth-screen-content w-100 animate-fade-in" style={{ maxWidth: 420 }}>
          <Link to="/" className="d-inline-flex align-items-center gap-2 text-muted text-decoration-none small mb-4">
            <i className="ti ti-arrow-left" />
            Back to home
          </Link>
          <h1 className="h3 fw-bold mb-1">{title}</h1>
          <p className="text-muted small mb-4">{subtitle}</p>
          {children}
        </div>
      </div>
      <div className="auth-screen-right d-none d-lg-flex align-items-center justify-content-center p-5">
        <div className="auth-screen-right-inner rounded-4 overflow-hidden shadow-lg">
          <img src={authSideImg} alt="Bolo Bill" className="img-fluid" />
        </div>
      </div>
    </div>
  );
}
