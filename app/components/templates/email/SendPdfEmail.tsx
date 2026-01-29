// React-email
import {
    Html,
    Body,
    Head,
    Heading,
    Hr,
    Container,
    Preview,
    Section,
    Text,
    Img,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

// Variables
import { BASE_URL } from "@/lib/variables";

type SendPdfEmailProps = {
    proposalNumber: string;
};

export default function SendPdfEmail({ proposalNumber }: SendPdfEmailProps) {
    const logo = `${BASE_URL}/assets/img/anc-logo.png`;
    return (
        <Html>
            <Head />
            <Preview>
                Your ANC Proposal #{proposalNumber} is ready for download
            </Preview>
            <Tailwind>
                <Body className="bg-gray-100">
                    <Container>
                        <Section className="bg-white border-black-950 my-10 px-10 py-4 rounded-md">
                            <Img
                                src={logo}
                                alt="ANC Logo"
                                width={120}
                                height={60}
                            />
                            <Heading className="leading-tight">
                                Your ANC Proposal is Ready
                            </Heading>

                            <Text>
                                We're pleased to inform you that your proposal{" "}
                                <b>#{proposalNumber}</b> is ready for download.
                                Please find the attached PDF document.
                            </Text>

                            <Hr />

                            <Text>
                                Best Regards,
                                <br />
                                ANC Proposal Studio
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
