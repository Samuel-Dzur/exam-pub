package samuel.dzur.hospoda.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.core.annotation.AnnotatedElementUtils;
import samuel.dzur.hospoda.backend.security.annotation.BartenderOnly;
import samuel.dzur.hospoda.backend.security.annotation.CustomerOnly;

@Component("endpointAuthorization")
public class EndpointAuthorization {

    public boolean hasAnyRequiredRole(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
        if (!(requestAttributes instanceof ServletRequestAttributes servletAttributes)) {
            return false;
        }

        Object handler = servletAttributes.getRequest()
            .getAttribute(HandlerMapping.BEST_MATCHING_HANDLER_ATTRIBUTE);
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return false;
        }

        boolean bartenderAllowed =
            AnnotatedElementUtils.hasAnnotation(handlerMethod.getMethod(), BartenderOnly.class)
                && authentication.getAuthorities().contains(
                    new SimpleGrantedAuthority("ROLE_BARTENDER")
                );
        boolean customerAllowed =
            AnnotatedElementUtils.hasAnnotation(handlerMethod.getMethod(), CustomerOnly.class)
                && authentication.getAuthorities().contains(
                    new SimpleGrantedAuthority("ROLE_CUSTOMER")
                );
        return bartenderAllowed || customerAllowed;
    }
}
