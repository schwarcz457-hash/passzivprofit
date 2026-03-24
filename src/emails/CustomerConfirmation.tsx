import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface EmailProps {
  name: string;
  locale: string;
  t: (key: string) => string;
}

export const CustomerConfirmation = ({ name, t }: EmailProps) => (
  <Html>
    <Head />
    <Preview>{t("customerSubject")}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <div style={logoBadge}>P</div>
          <Text style={logoText}>Passzív Profit</Text>
        </Section>
        <Heading style={h1}>{t("customerTitle").replace("{name}", name)}</Heading>
        <Text style={text}>{t("customerSubtitle")}</Text>
        <Section style={stepsSection}>
          <div style={stepItem}>
            <span style={stepNumber}>1</span> {t("step1")}
          </div>
          <div style={stepItem}>
            <span style={stepNumber}>2</span> {t("step2")}
          </div>
          <div style={stepItem}>
            <span style={stepNumber}>3</span> {t("step3")}
          </div>
        </Section>
        <Section style={btnSection}>
          <Button style={button} href="https://passzivprofit.com">
            {t("button")}
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>{t("footer")}</Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#0a0a0a",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: "20px 0",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  backgroundColor: "#111111",
  borderRadius: "16px",
  maxWidth: "600px",
  border: "1px solid #333333",
};

const logoSection = { textAlign: "center" as const, marginBottom: "30px" };
const logoBadge = { 
  width: "40px", 
  height: "40px", 
  backgroundColor: "#D4AF37", 
  borderRadius: "50%", 
  display: "inline-block", 
  textAlign: "center" as const, 
  lineHeight: "40px", 
  color: "#000", 
  fontWeight: "bold", 
  fontSize: "20px" 
};
const logoText = { color: "#ffffff", fontSize: "18px", fontWeight: "600", marginTop: "10px", marginHeader: "0" };

const h1 = { color: "#D4AF37", fontSize: "24px", fontWeight: "700", textAlign: "center" as const, margin: "30px 0" };
const text = { color: "#cccccc", fontSize: "16px", lineHeight: "1.6", textAlign: "center" as const };

const stepsSection = { margin: "30px 0", color: "#ffffff" };
const stepItem = { padding: "12px 0", borderBottom: "1px solid #222", fontSize: "15px", color: "#ffffff" };
const stepNumber = { color: "#D4AF37", fontWeight: "700", marginRight: "10px" };

const btnSection = { textAlign: "center" as const, margin: "40px 0" };
const button = { 
  backgroundColor: "#D4AF37", 
  borderRadius: "8px", 
  color: "#000", 
  fontSize: "16px", 
  fontWeight: "700", 
  textDecoration: "none", 
  textAlign: "center" as const, 
  display: "inline-block", 
  padding: "15px 25px" 
};

const hr = { borderColor: "#333333", margin: "40px 0" };
const footer = { color: "#666666", fontSize: "12px", textAlign: "center" as const };
