import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface CapsuleEmailProps {
  openUrl: string;
  deliveryDate: string;
}

export function CapsuleDeliveryEmail({ openUrl, deliveryDate }: CapsuleEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Something has been waiting for you.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={section}>
            <Heading style={heading}>Afterward</Heading>
            <Text style={paragraph}>
              A message written in the past is ready to be opened.
            </Text>
            <Text style={dateText}>Sealed until {deliveryDate}</Text>
            <Button style={button} href={openUrl}>
              Open your capsule
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#FAF7F2",
  fontFamily: "Georgia, 'Times New Roman', serif",
};

const container = {
  margin: "0 auto",
  padding: "48px 24px",
  maxWidth: "480px",
};

const section = {
  textAlign: "center" as const,
};

const heading = {
  color: "#2B2A28",
  fontSize: "24px",
  fontWeight: "400",
  letterSpacing: "0.05em",
  margin: "0 0 32px",
};

const paragraph = {
  color: "#2B2A28",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 0 16px",
};

const dateText = {
  color: "#3D4F5C",
  fontSize: "14px",
  margin: "0 0 32px",
};

const button = {
  backgroundColor: "#3D4F5C",
  borderRadius: "8px",
  color: "#FAF7F2",
  display: "inline-block",
  fontSize: "15px",
  padding: "14px 28px",
  textDecoration: "none",
};

export default CapsuleDeliveryEmail;
