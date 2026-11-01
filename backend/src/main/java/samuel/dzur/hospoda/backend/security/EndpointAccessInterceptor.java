package samuel.dzur.hospoda.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import samuel.dzur.hospoda.backend.security.annotation.BartenderAccess;
import samuel.dzur.hospoda.backend.security.annotation.CustomerAccess;
import samuel.dzur.hospoda.backend.security.annotation.PublicEndpoint;

import java.io.IOException;

@Component
public class EndpointAccessInterceptor implements HandlerInterceptor, WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(this);
    }

    @Override
    public boolean preHandle(
        HttpServletRequest request,
        HttpServletResponse response,
        Object handler
    ) throws IOException {
        if (isOpenApiDocsRequest(request)) {
            return true;
        }

        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        if (handlerMethod.hasMethodAnnotation(PublicEndpoint.class)) {
            return true;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean bartenderAllowed =
            handlerMethod.hasMethodAnnotation(BartenderAccess.class)
                && hasRole(authentication, "ROLE_BARTENDER");
        boolean customerAllowed =
            handlerMethod.hasMethodAnnotation(CustomerAccess.class)
                && hasRole(authentication, "ROLE_CUSTOMER");

        if (!bartenderAllowed && !customerAllowed) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN);
            return false;
        }
        return true;
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null
            && authentication.isAuthenticated()
            && authentication.getAuthorities().contains(new SimpleGrantedAuthority(role));
    }

    private boolean isOpenApiDocsRequest(HttpServletRequest request) {
        String contextPath = request.getContextPath();
        String requestPath = request.getRequestURI().substring(contextPath.length());
        return requestPath.equals("/v3/api-docs")
            || requestPath.startsWith("/v3/api-docs/");
    }
}
